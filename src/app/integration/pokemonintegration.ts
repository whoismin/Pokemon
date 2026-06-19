import axios from 'axios';
import { Pokemon } from '../@types/pokemon';

const API_URL = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
});

export const getPokemon = async (
  limit = 20,
  offset = 0
): Promise<Pokemon[]> => {
  const response = await API_URL.get(
    `/pokemon?limit=${limit}&offset=${offset}`
  );

  const list = response.data.results;

  const pokemonDetail = await Promise.all(
    list.map(async (pokemon: { url: string }) => {
      const pokemonValues = await axios.get(pokemon.url);

      const dadoPokemon = pokemonValues.data;

      const pokemonData: Pokemon = {
        index: dadoPokemon.id.toString().padStart(3, '0'),

        nome: dadoPokemon.name,

       imagem:
        dadoPokemon.sprites.other['official-artwork']
        .front_default,

        tipos: dadoPokemon.types.map(
          (t: any) => t.type.name
        ),

        poderes: dadoPokemon.stats.map((s: any) => ({
          nome: s.stat.name,
          forca: s.base_stat,
        })),
      };

      return pokemonData;
    })
  );

  return pokemonDetail;
};