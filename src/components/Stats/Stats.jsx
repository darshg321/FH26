import GlassContainer from "../Recap/RecapComponents/RecapProjects/GlassContainer";
import MinecraftNumbers from "../MinecraftNumbers";
import { EVENT_STATS } from "../../data/eventStats";

export default function Stats({ className = "" }) {
  return (
    <div
      className={`flex flex-row items-stretch justify-center gap-3 md:gap-5 lg:gap-6 ${className}`}
    >
      {EVENT_STATS.map((stat) => (
        <GlassContainer
          key={stat.label}
          className="flex flex-col items-center justify-center px-5 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 text-white"
        >
          <div className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-fuchsia-300 to-purple-500">
            <MinecraftNumbers>{stat.value}</MinecraftNumbers>
          </div>
          <div className="text-xs md:text-sm lg:text-base text-white/60">
            {stat.label}
          </div>
        </GlassContainer>
      ))}
    </div>
  );
}
