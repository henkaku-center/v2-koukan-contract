import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("HenkakuKoukan", function () {
  async function deployKoukanFixture() {
    const [owner, ...otherAccount] = await ethers.getSigners();

    const mock = await ethers.getContractFactory("MockERC20")
    const v1Token = await mock.deploy('v1Token')
    const v2Token = await mock.deploy('v1Token')
    await v1Token.deployed()
    await v2Token.deployed()

    const Koukan = await ethers.getContractFactory("HenkakuKoukan");
    const koukan: any = await Koukan.deploy(v1Token.address, v2Token.address)
    await koukan.deployed()
    await v2Token.mint(koukan.address, ethers.utils.parseUnits('1000', 18))
    return { koukan, v1Token, v2Token, owner, otherAccount };
  }

  describe("ClaimV2Token", function () {
    it("user should be able to claim v2token", async function () {
      const { koukan, v1Token, v2Token, owner, otherAccount } = await loadFixture(deployKoukanFixture);
      const [alice] = otherAccount
      const amount = ethers.utils.parseUnits('1000', 18)

      await v1Token.mint(alice.address, amount)
      await v1Token.connect(alice).approve(koukan.address, ethers.constants.MaxInt256)
      expect(await v2Token.balanceOf(alice.address)).to.eq(0)

      await expect(koukan.connect(alice).claimV2Token())
      .to.emit(koukan, 'Claim')
      .withArgs(amount, alice.address)

      expect(await v1Token.balanceOf(alice.address)).to.eq(0)
      expect(await v2Token.balanceOf(alice.address)).to.eq(amount)
    });

    it("reverts if users don't have v1token", async () => {
      const { koukan, v1Token, v2Token, owner, otherAccount } = await loadFixture(deployKoukanFixture);
      const [alice] = otherAccount
      const amount = ethers.utils.parseUnits('1000', 18)
      await v1Token.connect(alice).approve(koukan.address, ethers.constants.MaxInt256)
      expect(await v1Token.balanceOf(alice.address)).to.eq(0)

      await expect(koukan.connect(alice).claimV2Token())
        .to.revertedWith('INVALID: YOU DO NOT HAVE V1 TOKEN');
    })

    it("reverts if contract doesn't have enough v2Token", async() => {
      const { koukan, v1Token, v2Token, owner, otherAccount } = await loadFixture(deployKoukanFixture);
      const [alice] = otherAccount
      const amount = ethers.utils.parseUnits('20000000000000', 18)
      await v1Token.mint(alice.address, amount)
      await v1Token.connect(alice).approve(koukan.address, ethers.constants.MaxInt256)
      expect(await v2Token.balanceOf(alice.address)).to.eq(0)

      await expect(koukan.connect(alice).claimV2Token())
        .to.revertedWith('INVALID: INSUFFICIENT AMOUNT');
    })
  });

  describe("Withdrawals", function () {
    it("widthdraw v2 token successfully", async () => {
      const { koukan, v1Token, v2Token, owner, otherAccount } = await loadFixture(deployKoukanFixture);
      const amount = await v2Token.balanceOf(koukan.address)
      expect(await v2Token.balanceOf(owner.address)).to.eq(0)
      await koukan.widthdraw(v2Token.address)

      expect(await v2Token.balanceOf(owner.address)).to.eq(amount)
    });

    it("revert if contract doesnot have enough amount", async () => {
      const { koukan, v1Token, v2Token, owner, otherAccount } = await loadFixture(deployKoukanFixture);
      const amount = ethers.utils.parseUnits('100', 18)
      expect(await v1Token.balanceOf(koukan.address)).to.eq(0)
      await expect(koukan.widthdraw(v1Token.address))
      .to.revertedWith('INVLAID: INSUFFICENT AMOUNT')
    });
  });
});
