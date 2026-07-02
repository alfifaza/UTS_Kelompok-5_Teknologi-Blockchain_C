const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxOTVlNDdiZi05MjdhLTQ0Y2EtYTgxNS05YjNiNDVjOGVmNTMiLCJlbWFpbCI6InNpc3dhbnRvaXJhd2FuN0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTkxYWI3ZTMwZTBlZWUwNDA5M2UiLCJzY29wZWRLZXlTZWNyZXQiOiI1NTQ5MzRiNTk2NzA0N2RmMDBhMTc4ZjhlNjllMjRmMjA4OTlkODZmZDQzYjk4ZTZkNzYwYTc3MDNkMDc2ZTE5IiwiZXhwIjoxODEzODg4NzkzfQ.P4ePOKNiVimJ3czrOOxnVdUqDD6sgGzU_i7ojJZsSp4";

const PINATA_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export const uploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({ name: file.name });
  formData.append("pinataMetadata", metadata);

  const response = await fetch(PINATA_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload IPFS gagal: ${errorText}`);
  }

  const data = await response.json();
  return data.IpfsHash;
};

export const getIPFSUrl = (cid) => {
  return `${PINATA_GATEWAY}/${cid}`;
};

export const fetchFromIPFS = async (cid) => {
  const url = getIPFSUrl(cid);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Gagal mengambil file dari IPFS");
  }
  return await response.blob();
};