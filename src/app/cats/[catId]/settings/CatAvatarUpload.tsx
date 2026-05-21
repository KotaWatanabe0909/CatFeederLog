"use client";

import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { updateCatAvatar } from "./actions";

type Props = {
  catId: string;
  currentUrl: string | null;
  size?: "md" | "lg";
};

const CROP_SIZE = 280;
const OUTPUT_SIZE = 512;

export function CatAvatarUpload({ catId, currentUrl, size = "md" }: Props) {
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cropUrl, setCropUrl] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const avatarClass =
    size === "lg"
      ? "relative h-32 w-32 overflow-hidden rounded-full bg-gray-100 ring-4 ring-white shadow-sm"
      : "relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200";
  const imageSize = size === "lg" ? 128 : 96;
  const fallbackClass =
    size === "lg"
      ? "flex h-full w-full items-center justify-center text-5xl"
      : "flex h-full w-full items-center justify-center text-4xl";
  const baseScale =
    naturalSize.width > 0 && naturalSize.height > 0
      ? Math.max(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height)
      : 1;
  const displayWidth = naturalSize.width * baseScale * zoom;
  const displayHeight = naturalSize.height * baseScale * zoom;
  const maxOffsetX = Math.max(0, (displayWidth - CROP_SIZE) / 2);
  const maxOffsetY = Math.max(0, (displayHeight - CROP_SIZE) / 2);
  const cropOffset = {
    x: Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x)),
    y: Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y)),
  };

  useEffect(() => {
    return () => {
      if (cropUrl) URL.revokeObjectURL(cropUrl);
    };
  }, [cropUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    if (cropUrl) URL.revokeObjectURL(cropUrl);

    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
      setCropFile(file);
      setCropUrl(objectUrl);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      e.target.value = "";
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage("写真を読み込めませんでした");
      e.target.value = "";
    };
    image.src = objectUrl;
  };

  const closeCrop = () => {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropUrl(null);
    setCropFile(null);
    setNaturalSize({ width: 0, height: 0 });
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const createCroppedFile = async () => {
    if (!cropFile || !cropUrl || !naturalSize.width || !naturalSize.height) {
      return null;
    }

    const image = new window.Image();
    image.src = cropUrl;
    await image.decode();

    const scale = baseScale * zoom;
    const imageLeft = CROP_SIZE / 2 + cropOffset.x - displayWidth / 2;
    const imageTop = CROP_SIZE / 2 + cropOffset.y - displayHeight / 2;
    const sourceX = (0 - imageLeft) / scale;
    const sourceY = (0 - imageTop) / scale;
    const sourceSize = CROP_SIZE / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) return null;

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(new File([blob], "cat-avatar.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const saveCroppedImage = async () => {
    setUploading(true);
    setErrorMessage(null);

    const file = await createCroppedFile();
    if (!file) {
      setErrorMessage("写真の編集に失敗しました");
      setUploading(false);
      return;
    }

    const path = `${catId}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("cat-avatars")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (error) {
      setErrorMessage("写真のアップロードに失敗しました");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("cat-avatars").getPublicUrl(path);
    const result = await updateCatAvatar(catId, data.publicUrl);

    if ("error" in result) {
      setErrorMessage(result.error);
    } else {
      setPreviewUrl(result.avatarUrl);
      closeCrop();
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={avatarClass}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="猫の写真"
            width={imageSize}
            height={imageSize}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className={fallbackClass}>🐱</span>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-xs text-white">送信中</span>
          </div>
        )}
      </button>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-gray-500 underline-offset-2 hover:underline disabled:opacity-50"
      >
        {previewUrl ? "写真を変更" : "写真を追加"}
      </button>
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {cropUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">写真を調整</h2>
              <button
                type="button"
                onClick={closeCrop}
                disabled={uploading}
                className="text-sm text-gray-400 disabled:opacity-50"
              >
                閉じる
              </button>
            </div>

            <div className="flex justify-center">
              <div
                className="relative overflow-hidden rounded-full bg-gray-100"
                style={{ width: CROP_SIZE, height: CROP_SIZE }}
              >
                <div
                  className="absolute bg-cover bg-center"
                  style={{
                    width: displayWidth,
                    height: displayHeight,
                    left: CROP_SIZE / 2 + cropOffset.x - displayWidth / 2,
                    top: CROP_SIZE / 2 + cropOffset.y - displayHeight / 2,
                    backgroundImage: `url(${cropUrl})`,
                  }}
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-sm text-white">保存中</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="text-sm text-gray-600">
                拡大
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  disabled={uploading}
                  className="mt-2 w-full"
                />
              </label>
              <label className="text-sm text-gray-600">
                左右
                <input
                  type="range"
                  min={-maxOffsetX}
                  max={maxOffsetX}
                  step="1"
                  value={cropOffset.x}
                  onChange={(e) =>
                    setOffset((current) => ({
                      ...current,
                      x: Number(e.target.value),
                    }))
                  }
                  disabled={uploading || maxOffsetX === 0}
                  className="mt-2 w-full"
                />
              </label>
              <label className="text-sm text-gray-600">
                上下
                <input
                  type="range"
                  min={-maxOffsetY}
                  max={maxOffsetY}
                  step="1"
                  value={cropOffset.y}
                  onChange={(e) =>
                    setOffset((current) => ({
                      ...current,
                      y: Number(e.target.value),
                    }))
                  }
                  disabled={uploading || maxOffsetY === 0}
                  className="mt-2 w-full"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeCrop}
                disabled={uploading}
                className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveCroppedImage}
                disabled={uploading}
                className="flex-1 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
