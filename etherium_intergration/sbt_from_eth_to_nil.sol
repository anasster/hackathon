// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SBTfromETH2NIL is ERC721, Ownable {
    uint256 public tokenIdCounter;
    uint256 public originalTokenId;

    mapping(string => uint256) public nillionToTokenId; // Maps Nillion address to token ID

    event Mapped(string indexed nillionAddress, uint256 indexed tokenId);
    event SBTMinted(uint256 indexed tokenId);

    constructor(address _admin) ERC721("Nillion SBT", "NSBT") Ownable(_admin) {
        originalTokenId = 0;
        tokenIdCounter = 1; // Start token IDs from 1
    }

    function mintOriginalSBT() external onlyOwner {
        require(originalTokenId == 0, "Original SBT already minted");

        originalTokenId = tokenIdCounter;
        _mint(msg.sender, tokenIdCounter);

        emit SBTMinted(tokenIdCounter);
        tokenIdCounter++;
    }

    function mintCopy() internal onlyOwner returns (uint256) {
        require(originalTokenId > 0, "Original SBT must be minted first");

        uint256 newTokenId = tokenIdCounter;
        _mint(msg.sender, newTokenId);

        emit SBTMinted(newTokenId);
        tokenIdCounter++;
    
        return newTokenId; // Return the minted token ID
    }

    // function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
    //     require(from == address(0) || to == address(0), "SBTs are non-transferable");
    //     super._beforeTokenTransfer(from, to, tokenId);
    // }

    function registerAndMint(string memory nillionAddress) external onlyOwner {
        require(nillionToTokenId[nillionAddress] == 0, "Nillion address already mapped");
        require(originalTokenId != 0, "Original SBT must be minted first");

        // Mint an SBT copy for this Nillion user
        uint256 tokenId = mintCopy();

        // Map the Nillion address to the newly minted token ID
        nillionToTokenId[nillionAddress] = tokenId;

        emit Mapped(nillionAddress, tokenId);
        emit SBTMinted(tokenId);
    }

    function isMapped(string memory nillionAddress) external view returns (bool) {
        return nillionToTokenId[nillionAddress] != 0;
    }

}