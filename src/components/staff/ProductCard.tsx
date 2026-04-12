import { motion } from "framer-motion";
import { Plus, Crown } from "lucide-react";
import type { Product } from "../../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Card from "../ui/Card";
import { Heading, Subheading, Label } from "../ui/Typography";
import { formatCurrency } from "../../utils/format";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductCardProps {
  product: Product;
  cartItem?: { quantity: number };
  isBestSeller?: boolean;
  onClick: () => void;
}

export const ProductCard = ({
  product,
  cartItem,
  isBestSeller,
  onClick,
}: ProductCardProps) => {
  const isManis = product.category === "manis";
  const accentColor = isManis ? "emerald" : "amber";

  return (
    <Card
      variant={cartItem ? "white" : "glass"}
      padding="none"
      initial={false}
      onClick={onClick}
      hoverScale={false}
      className={cn(
        "!text-left !flex !flex-col !justify-between min-h-[160px] !p-4 !rounded-[2rem] active:scale-95 cursor-pointer !border",
        cartItem
          ? isManis
            ? "!bg-emerald-100/90 !border-emerald-200"
            : "!bg-amber-100/90 !border-amber-200"
          : "!bg-white/60 !border-white/80",
      )}
    >
      {isBestSeller && (
        <div className="absolute top-3 right-3 !px-2.5 !py-1 !bg-amber-500 rounded-full flex items-center gap-1 shadow-lg border border-white/30 z-20">
          <Crown className="!text-white !fill-white" size={10} />
          <span className="text-[7px] font-black tracking-widest !text-white uppercase">
            Best Seller
          </span>
        </div>
      )}

      <div className="!space-y-1.5">
        <Label className="!opacity-60">
          {product.category === "telor" ? product.eggType : product.category}
        </Label>
        <Heading
          as="h3"
          className={cn(
            "!text-sm !not-italic !tracking-normal group-hover:text-emerald-600 transition-colors !line-clamp-2",
            cartItem ? "text-slate-900" : "text-slate-800",
          )}
        >
          {product.name}
        </Heading>
      </div>

      <div
        className={cn(
          "!flex !justify-between !items-end !mt-4 !pt-3 !border-t transition-colors",
          cartItem ? "border-slate-300/50" : "border-slate-200/50",
        )}
      >
        <div className="!flex !flex-col">
          {isManis && (
            <Subheading className="!text-[10px] !opacity-70">Mulai</Subheading>
          )}
          <Heading
            as="p"
            className={cn(
              "!text-lg !leading-none",
              accentColor === "emerald" ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {formatCurrency(product.basePrice)}
          </Heading>
        </div>
        <div
          className={cn(
            "bg-emerald-600 text-white !p-2 rounded-xl shadow-lg transition-transform group-active:scale-90",
            accentColor === "amber" && "!bg-amber-600",
          )}
        >
          <Plus size={16} strokeWidth={3} />
        </div>
      </div>

      {cartItem && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow-lg border-4 border-sky-100 z-10"
        >
          {cartItem.quantity}
        </motion.div>
      )}
    </Card>
  );
};
