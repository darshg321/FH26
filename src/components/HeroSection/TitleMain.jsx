import GalleryButton from "../Gallery/GalleryButton";
import MinecraftNumbers from "../MinecraftNumbers";
import { EVENT_STATS } from "../../data/eventStats";

export default function TitleMain() {
  return (
    <div className="relative mt-24 ml-8 sm:mt-24 sm:ml-24 md:mt-32 md:ml-36 lg:mt-54 lg:ml-48 text-white">
      <span
        className="absolute inset-0 text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tight
               text-fuchsia-800
               -z-10
               translate-x-[-6px] translate-y-[6px]"
        style={{
          textShadow: `
        0 0 14px rgba(217,70,239,0.6),
        0 0 34px rgba(217,70,239,0.45),
        0 0 70px rgba(168,85,247,0.35)
      `,
        }}
      >
        <MinecraftNumbers>FraserHacks26</MinecraftNumbers>
      </span>
      <h1 className="text-4xl md:text-6xl xl:text-7xl 2xl:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-fuchsia-300 to-purple-500 ">
        <MinecraftNumbers>FraserHacks26</MinecraftNumbers>
      </h1>
      <div className="text-base md:text-lg lg:text-xl xl:text-2xl mt-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 mb-3 text-xs md:text-sm font-black text-fuchsia-100">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
          That's a wrap!
        </div>
        <div className="flex flex-row">
          <div className="font-black mr-2">Mississauga's largest high school hackathon</div>
        </div>
        <div>
          <MinecraftNumbers>March 26, 2026</MinecraftNumbers> • In-person <MinecraftNumbers>(8am–6pm)</MinecraftNumbers>
        </div>
        <div className="flex flex-row items-center gap-1.5 mb-4">
          <img src="/icons/map-pin.png" className="h-[1em] w-[1em]" alt="location"/>
          <div className="font-black mr-2">John Fraser SS • Thanks to everyone who came out!</div>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm md:text-base lg:text-lg">
          {EVENT_STATS.map((stat, index) => (
            <div key={stat.label} className="flex flex-row items-center gap-x-3">
              {index > 0 && <span className="opacity-40">•</span>}
              <div>
                <MinecraftNumbers className="font-black">{stat.value}</MinecraftNumbers>{" "}
                <span className="opacity-70">{stat.label.toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-row mb-3 items-center">
          <GalleryButton />
          <div className="font-black ml-3">Relive the day!</div>
        </div>
        <div className="flex flex-col text-xs md:text-sm lg:text-base xl:text-lg font-normal">
          <a className="flex flex-row gap-1.5 items-center cursor-pointer hover:underline hover:underline-offset-3" target="_blank" href="https://www.instagram.com/fraser.hacks/" rel="noopener noreferrer">
            <img src="/icons/instagram.png" className="h-[1em] w-[1em]" alt="instagram"/>
            <div>Want to stay in the loop for next year? Check out our Instagram!</div>
          </a>
        </div>
      </div>
    </div>
  );
}
