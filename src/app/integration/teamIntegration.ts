import axios from 'axios';
import { Pokemon } from '../@types/pokemon';

const api = axios.create({
  baseURL:
    'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon',
});

type PokemonApi = {
  index: string;
  name: string;
  image: string;
  types: string[];
  abilities: {
    name: string;
    strength: number;
  }[];
};

export async function getTeam(userId: string): Promise<Pokemon[]> {
  const response = await api.get('/pokemon/v1/team', {
    params: {
      'user-id': userId,
    },
  });

  console.log('RESPOSTA TIME API:', response.data);

  const team: PokemonApi[] = response.data.team || [];

  return team.map((pokemon) => ({
    index: pokemon.index,
    nome: pokemon.name,
    imagem: pokemon.image,
    tipos: pokemon.types,
    poderes: pokemon.abilities.map((ability) => ({
      nome: ability.name,
      forca: ability.strength,
    })),
  }));
}