import { ChevronLeft, type LucideIcon, X } from "lucide-react";
import { Heading } from "../ui/Typography";
import Button from "../ui/Button";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onClose?: () => void;
  icon?: LucideIcon;
}

const SectionHeader = ({
  title,
  subtitle,
  onBack,
  onClose,
  icon: Icon,
}: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between !px-4">
      <div className="flex items-center gap-6">
        {onBack && (
          <Button
            variant="white"
            size="sm"
            onClick={onBack}
            className="!p-2.5 !bg-white !rounded-xl shadow-sm border border-slate-100 text-slate-400 active:scale-90 transition-all"
          >
            <ChevronLeft size={22} strokeWidth={3} />
          </Button>
        )}
        <div className="text-left space-y-1">
          <Heading
            as="h2"
            className="!text-lg !tracking-tight !text-slate-800 break-words line-clamp-1"
          >
            {title}
          </Heading>
          {subtitle && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {(onClose || Icon) && (
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
              <Icon size={20} />
            </div>
          )}
          {onClose && (
            <Button
              variant="white"
              size="sm"
              onClick={onClose}
              className="!p-2.5 !bg-slate-50 !rounded-xl text-slate-400"
            >
              <X size={20} strokeWidth={3} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
