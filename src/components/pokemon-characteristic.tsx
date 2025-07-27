import { cn } from "@/lib/utils"
import { Check, X, ArrowUp, ArrowDown } from "lucide-react"

interface PokemonCharacteristicProps {
  label: string
  value: string | number
  result: "correct" | "wrong" | "higher" | "lower"
  className?: string
}

export function PokemonCharacteristic({ label, value, result, className }: PokemonCharacteristicProps) {
  const getColors = () => {
    switch (result) {
      case "correct":
        return "bg-green-500 border-green-600 text-white drop-shadow-lg"
      case "higher":
      case "lower":
      case "wrong":
      default:
        return "bg-gray-400 border-gray-500 text-white drop-shadow-lg"
    }
  }

  const getIcon = () => {
    switch (result) {
      case "correct":
        return <Check className="w-6 h-6" />
      case "wrong":
        return <X className="w-6 h-6" />
      case "higher":
        return <ArrowDown className="w-6 h-6" />
      case "lower":
        return <ArrowUp className="w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="text-xs font-medium text-gray-300 mb-1">{label}</div>
      <div
        className={cn(
          "relative w-20 h-20 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200",
          getColors(),
        )}
      >

        <div className="relative z-10 text-center">
          <div className="text-sm font-bold leading-none">{value}</div>
          <div className="mt-0.5 flex justify-center">{getIcon()}</div>
        </div>
      </div>
    </div>
  )
}
