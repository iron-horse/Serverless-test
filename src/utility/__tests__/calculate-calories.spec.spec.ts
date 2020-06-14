import { findCalories } from "../calculate-calories";
import mock4pcChickenData from "../../mock-data/4pc-chicken";

describe("Should find Calories for given combo item", () => {
  it("should find calories for given combo item with minAmount > 0", () => {
    expect(findCalories(mock4pcChickenData.comboItems[0])).toEqual({
      maxCalories: 1030,
      minCalories: 1030,
    });
  });

  it("should find correct calories for given combo item with minAmount = 0", () => {
    expect(findCalories(mock4pcChickenData.comboItems[3])).toEqual({
      maxCalories: 480,
      minCalories: 0,
    });
  });

  it("should get all available best item before looking for next item for min or max calories", () => {
    // item with min and max calories have available qty: 9
    //  so when requested for 10 item it should take 9 items for best available min/max calorie and find next best available min/max calorie item
    expect(
      findCalories({
        ...mock4pcChickenData.comboItems[3],
        amountRequiredToSelect: 10,
      })
    ).toEqual({
      maxCalories: 480 * 9 + 440 * 1,
      minCalories: 0 * 9 + 0 * 1,
    });
  });

  it("should get break when we reach to amountRequiredToSelect == 0", () => {
    // when there is only one time is there with minAmount: 1 and maxAmount = 2 & amountRequiredToSelect = 2
    // it should loop through one item to get correct calories, ideally with one option minAmount == amountRequiredToSelect
    // but system should handle this edge case.
    expect(
      findCalories({
        ...mock4pcChickenData.comboItems[2],
        amountRequiredToSelect: 2,
        comboItemOptions: [
          {
            ...mock4pcChickenData.comboItems[2].comboItemOptions[0],
            maxAmount: 2,
          },
        ],
      })
    ).toEqual({
      maxCalories: 207 + 207,
      minCalories: 207 + 207,
    });
  });
  it("should throw an error when corrupted data found", () => {
    /**
     * required to select is 5 but available options are 4
     */
    expect(() => {
      findCalories({
        ...mock4pcChickenData.comboItems[0],
        amountRequiredToSelect: 5,
      });
    }).toThrowError(
      "Used all the items from the options but still amountRequiredToSelect > 0"
    );
  });
});
