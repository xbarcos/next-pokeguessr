import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

interface DailyPokemonData {
  pokemon: any
  date: string
  lastIds: number[]
  changeCount: number
}

const DB_PATH = path.join(process.cwd(), "data", "daily-pokemon.json")

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function getDailyPokemonFromDB(): DailyPokemonData | null {
  try {
    ensureDataDir()
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error reading daily pokemon from DB:", error)
  }
  return null
}

function saveDailyPokemonToDB(data: DailyPokemonData) {
  try {
    ensureDataDir()
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error("Error saving daily pokemon to DB:", error)
  }
}

function selectDailyPokemon(pokemonList: any[], date: string, lastIds: number[], salt: number = 0) {
  let hash = 0
  const seed = date + "-" + salt
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  const available = pokemonList.filter(p => !lastIds.includes(p.id))
  if (available.length === 0) {
    return pokemonList[Math.abs(hash) % pokemonList.length]
  }
  const index = Math.abs(hash) % available.length
  return available[index]
}

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      .split("/").reverse().join("-")

    const existingData = getDailyPokemonFromDB()
    if (existingData && existingData.date === today) {
      return NextResponse.json(existingData)
    }

    const pokemonDataPath = path.join(process.cwd(), "public", "pokemon-data.json")
    if (!fs.existsSync(pokemonDataPath)) {
      return NextResponse.json({ error: "Pokemon data not found" }, { status: 404 })
    }

    const pokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, "utf8"))
    const lastIds = existingData?.lastIds ?? []
    const dailyPokemon = selectDailyPokemon(pokemonData, today, lastIds)
    const newLastIds = [...lastIds, dailyPokemon.id].slice(-10)

    const newData: DailyPokemonData = {
      pokemon: dailyPokemon,
      date: today,
      lastIds: newLastIds,
      changeCount: 0,
    }

    saveDailyPokemonToDB(newData)

    return NextResponse.json(newData)
  } catch (error) {
    console.error("Error in daily-pokemon API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const today = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      .split("/").reverse().join("-")

    const pokemonDataPath = path.join(process.cwd(), "public", "pokemon-data.json")
    if (!fs.existsSync(pokemonDataPath)) {
      return NextResponse.json({ error: "Pokemon data not found" }, { status: 404 })
    }
    const pokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, "utf8"))

    let existingData = getDailyPokemonFromDB()
    let lastIds = existingData?.lastIds ?? []
    let changeCount = (existingData?.date === today ? existingData.changeCount : 0) + 1

    let newPokemon = selectDailyPokemon(pokemonData, today, lastIds, changeCount)
    let newLastIds = [...lastIds, newPokemon.id].slice(-10)

    const newData: DailyPokemonData = {
      pokemon: newPokemon,
      date: today,
      lastIds: newLastIds,
      changeCount,
    }

    saveDailyPokemonToDB(newData)

    return NextResponse.json(newData)
  } catch (error) {
    console.error("Error in daily-pokemon POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}