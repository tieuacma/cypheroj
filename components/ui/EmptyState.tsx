"use client";

import { motion } from "framer-motion";
import { Search, FileText, AlertCircle, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  type: "search" | "no-data" | "error";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const emptyStateConfig = {
  search: {
    icon: <Search className="w-12 h-12" />,
    defaultTitle: "Không tìm thấy kết quả",
    defaultDescription: "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc của bạn",
  },
  "no-data": {
    icon: <FileText className="w-12 h-12" />,
    defaultTitle: "Không có dữ liệu",
    defaultDescription: "Chưa có nội dung nào để hiển thị tại đây",
  },
  error: {
    icon: <AlertCircle className="w-12 h-12" />,
    defaultTitle: "Đã xảy ra lỗi",
    defaultDescription: "Không thể tải dữ liệu. Vui lòng thử lại sau",
  },
};

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-cypher-cyan/10 border border-cypher-cyan/30 flex items-center justify-center text-cypher-cyan mb-6">
        {config.icon}
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      
      <p className="text-sm text-cypher-muted max-w-md mb-6">
        {description || config.defaultDescription}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cypher-cyan text-zinc-950 font-semibold hover:bg-cypher-cyan/95 transition-all hover:scale-105 active:scale-95 btn-press"
        >
          {type === "error" && <RefreshCw className="w-4 h-4" />}
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
