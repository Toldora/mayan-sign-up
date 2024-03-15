import { wavixApi } from './instance';

const sendMessage = async messageFormData => {
  const response = await wavixApi.post(
    `/messages?appid=${import.meta.env.VITE_WAVIX_API_KEY}`,
    messageFormData,
  );
  return response.data;
};

export { sendMessage };
