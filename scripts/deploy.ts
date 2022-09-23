import { ethers } from "hardhat";

async function main() {
  const Koukan = await ethers.getContractFactory("HenkakuKoukan");
  const v1Token = ''
  const v2Token = ''
  const koukan = await Koukan.deploy(v1Token, v2Token)
  await koukan.deployed()
  console.log('koukan address:', koukan.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
