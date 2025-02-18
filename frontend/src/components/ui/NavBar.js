const Navbar = ({ walletAddress, onConnectWallet, onInsertSmallPaper }) => {
  return (
    <div className="bg-transparent text-white w-full z-20 flex justify-between items-center">
      {/* Left Side - Logo */}
      <div className="text-xl pl-4 font-bold">My Digital Identity</div>

      {/* Right Side - Links and Wallet */}
      <div className="flex items-center space-x-6">
        {/* Data Link */}
        <a href="#" className="text-white hover:opacity-80 transition">
          SmallPaper
        </a>

        {/* Keplr Wallet Button with Icon */}
        <button
          onClick={onConnectWallet}
          className="flex items-center border border-black bg-white text-black px-4 py-2 h-full hover:bg-[#0000FF] hover:text-white hover:border-white transition text-lg group sm:px-3 sm:py-1 sm:text-sm md:px-4 md:py-2 lg:px-6 lg:py-3 lg:text-lg"
        >
          <span className="border border-black px-2 py-1 mr-2 rounded group-hover:border-white group-hover:text-white">
            K
          </span>
          {walletAddress ? "Wallet Connected" : "CONNECT KEPLR WALLET →"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
