import { getGenerationName } from "@/app/enums/generations";
import { Badge } from "./ui/badge";

export default function GenerationTipsBadge() {
  return <Badge className="bg-blue-500 text-white my-2">
    Pokédex até {getGenerationName(493)}
  </Badge>
}