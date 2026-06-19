import axios from 'axios';

const api = axios.create({
  baseURL:
    'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon',

  headers: {
    'Content-Type': 'application/json',
  },
});


// ===============================
// CADASTRAR USUÁRIO
// ===============================

export async function register(
  username: string,
  password: string
) {
  try {

    const response = await api.post(
      '/auth/v1/register',
      {
        username: username.trim(),
        password: password.trim(),
      }
    );


    console.log(
      'CADASTRO REALIZADO:',
      response.data
    );


    return response.data;


  } catch (error: any) {

    console.log(
      'ERRO CADASTRO:',
      error?.response?.data ||
      error.message
    );


    throw error;
  }
}



// ===============================
// LOGIN USUÁRIO
// ===============================

export async function login(
  username: string,
  password: string
) {

  try {

    const response = await api.post(
      '/auth/v1/login',
      {
        username: username.trim(),
        password: password.trim(),
      }
    );


    console.log(
      'LOGIN REALIZADO:',
      response.data
    );


    return response.data;


  } catch (error:any) {

    console.log(
      'ERRO LOGIN:',
      error?.response?.data ||
      error.message
    );


    throw error;

  }
}

export async function updateProfileStats(
  userId: string,
  level: number,
  vitorias: number,
  derrotas: number
) {
  const response = await api.put(
    `/auth/v1/stats/${userId}`,
    {
      level: String(level),
      vitorias: String(vitorias),
      derrotas: String(derrotas),
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}