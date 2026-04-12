import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { Product, DoughOption, ToppingOption } from "../../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Heading, Subheading, Label } from "../ui/Typography";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DoughSelectorModalProps {
  product: Product | null;
  doughOptions: DoughOption[];
  toppingOptions: ToppingOption[];
  selectedDoughId: string;
  setSelectedDoughId: (id: string) => void;
  onClose: () => void;
  onAdd: (
    product: Product,
    dough: DoughOption,
    toppings: ToppingOption[],
  ) => void;
}

export const DoughSelectorModal = ({
  product,
  doughOptions,
  toppingOptions,
  selectedDoughId,
  setSelectedDoughId,
  onClose,
  onAdd,
}: DoughSelectorModalProps) => {
  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);

  const activeDough =
    doughOptions.find((d) => d.id === selectedDoughId) || doughOptions[0];
  const isManis = product?.category === "manis";

  const toggleTopping = (id: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    );
  };

  const selectedToppingList = toppingOptions.filter((t) =>
    selectedToppingIds.includes(t.id),
  );

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="dough-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 !bg-slate-900/40 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <Card
            key="dough-modal-content"
            initial={{ opacity: 0, scale: 0.98, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.98, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.01 }}
            className="fixed top-1/2 left-1/2 w-[90%] max-w-[460px] !bg-white rounded-[1.5rem] shadow-2xl z-50 !p-5 !pb-6 !pt-6 !border border-white/60 text-center"
          >
            <div className="mb-4">
              <Subheading className="!text-emerald-600 !mb-1">
                Varian & Topping
              </Subheading>
              <Heading as="h3" className="!text-xl !tracking-normal">
                {product.name}
              </Heading>
            </div>

            <div className="!space-y-4 !mt-2 overflow-y-auto max-h-[45vh] sm:max-h-[55vh] px-1 cust-scrollbar pb-6">
              {/* Section Adonan */}
              <div className="!space-y-2">
                <Label className="!px-1 !py-1 block text-left !text-[10px] opacity-60 uppercase font-bold tracking-wider">
                  Pilih Adonan
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {doughOptions.map((dough, idx) => (
                    <Button
                      key={dough.id || `dough-${idx}`}
                      variant={
                        selectedDoughId === dough.id ? "emerald" : "white"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoughId(dough.id);
                      }}
                      className={cn(
                        "!m-1 !mx-1.5 flex flex-col items-center justify-center !p-2 !rounded-xl transition-all border !gap-0.5",
                        selectedDoughId === dough.id
                          ? "scale-105"
                          : "text-slate-500 !border-slate-100",
                      )}
                    >
                      <span className="text-[11px] font-bold">
                        {dough.label}
                      </span>
                      <span className="opacity-60 text-[8px]">
                        {dough.extraPrice > 0
                          ? `+${dough.extraPrice / 1000}k`
                          : "Free"}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Section Topping (Only for Manis for now) */}
              {isManis && (
                <div className="!space-y-2 pt-1">
                  <Label className="!px-1 !py-1 block text-left flex justify-between items-center !text-[10px] opacity-60 uppercase font-bold tracking-wider">
                    Extra Topping
                    <span className="opacity-40 uppercase tracking-widest font-bold">
                      Unlimited
                    </span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {toppingOptions.map((topping, idx) => {
                      const isSelected = selectedToppingIds.includes(
                        topping.id,
                      );
                      return (
                        <Button
                          key={topping.id || `topping-${idx}`}
                          variant={isSelected ? "emerald" : "white"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTopping(topping.id);
                          }}
                          className={cn(
                            "!m-1 !mx-1.5 flex flex-col items-center justify-center !p-2 !rounded-xl transition-all border !gap-0.5",
                            isSelected
                              ? "scale-105 !bg-amber-500 !border-amber-600 !text-white"
                              : "text-slate-500 !border-slate-100",
                          )}
                        >
                          <span className="text-[11px] font-bold">
                            {topping.label}
                          </span>
                          <span
                            className={cn(
                              "text-[8px] font-bold",
                              isSelected ? "text-amber-100" : "opacity-60",
                            )}
                          >
                            +{topping.price / 1000}k
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button
                variant="emerald"
                fullWidth
                size="lg"
                onClick={() => {
                  onAdd(product, activeDough, selectedToppingList);
                  setSelectedToppingIds([]); // Reset for next selection
                }}
                className="!mt-1.5 !rounded-[2rem] !text-xs !gap-3 relative"
              >
                Tambahkan
                <ChevronRight
                  size={16}
                  strokeWidth={3}
                  className="absolute right-8 opacity-80"
                />
              </Button>
            </div>
          </Card>
        </>
      )}
    </AnimatePresence>
  );
};
