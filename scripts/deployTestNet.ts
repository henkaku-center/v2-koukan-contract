import { ethers } from "hardhat";
import 'dotenv/config'
async function main() {
  const Koukan = await ethers.getContractFactory("HenkakuKoukan");
  const v1Token = process.env.GOEIRL_V1_TOKEN as string
  const v2Token = process.env.GOEIRL_V2_TOKEN as string
  console.log(v1Token, v2Token)
  const koukan = await Koukan.deploy(v1Token, v2Token)
  await koukan.deployed()
  await koukan.transferOwnership(process.env.GOERIL_OWNER as string);
  console.log('koukan address:', koukan.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
