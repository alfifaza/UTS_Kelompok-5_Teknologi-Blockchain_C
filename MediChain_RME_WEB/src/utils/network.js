export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 dalam hex
export const SEPOLIA_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

export const ensureSepoliaNetwork = async () => {
  if (!window.ethereum) return false;

  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

  if (currentChainId === SEPOLIA_CHAIN_ID) return true;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (switchError) {
    // Network belum ada di MetaMask, coba tambahkan
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_PARAMS],
        });
        return true;
      } catch (addError) {
        console.error('Gagal menambahkan Sepolia:', addError);
        return false;
      }
    }
    console.error('Gagal switch ke Sepolia:', switchError);
    return false;
  }
};