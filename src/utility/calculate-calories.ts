import { IComboItemOption, IComboItem } from "../types";

const sortComboItemOptions = (
  itemOptionA: IComboItemOption,
  itemOptionB: IComboItemOption
) => {
  const itemOptionACalories = itemOptionA.option.nutrition.calories;
  const itemOptionBCalories = itemOptionB.option.nutrition.calories;

  let comparison = 0;
  if (itemOptionACalories > itemOptionBCalories) {
    comparison = 1;
  } else if (itemOptionACalories < itemOptionBCalories) {
    comparison = -1;
  }
  return comparison;
};

const calculateIndex = (
  optionIndex: number,
  lastIndex: number,
  isMaxCaloriesCalculation: boolean,
  isRepeat: boolean
) => {
  if (!isMaxCaloriesCalculation) {
    if (optionIndex === lastIndex) {
      if (isRepeat) {
        throw new Error(
          "Used all the items from the options but still amountRequiredToSelect > 0"
        );
      }
      optionIndex = 0;
      isRepeat = true;
    } else {
      ++optionIndex;
    }
  } else {
    if (optionIndex === 0) {
      if (isRepeat) {
        throw new Error(
          "Used all the items from the options but still amountRequiredToSelect > 0"
        );
      }
      optionIndex = lastIndex;
      isRepeat = true;
    } else {
      --optionIndex;
    }
  }
  return { optionIndex, isRepeat };
};

const calculateCalories = (
  sortedComboOptions: IComboItemOption[],
  amountRequiredToSelect: number,
  isMaxCaloriesCalculation: boolean = false
) => {
  let calculatedCalories = 0;
  let isRepeat: boolean = false;
  let optionIndex = isMaxCaloriesCalculation
    ? sortedComboOptions.length - 1
    : 0;

  for (optionIndex; amountRequiredToSelect > 0; ) {
    const item = sortedComboOptions[optionIndex];

    const itemAvailability = item.maxAmount - item.minAmount;
    let itemCount = isRepeat
      ? amountRequiredToSelect > itemAvailability
        ? itemAvailability
        : amountRequiredToSelect
      : item.minAmount;

    if (itemCount === 0) {
      const indexInfo = calculateIndex(
        optionIndex,
        sortedComboOptions.length - 1,
        isMaxCaloriesCalculation,
        isRepeat
      );
      optionIndex = indexInfo.optionIndex;
      isRepeat = indexInfo.isRepeat;

      // already used all the amount for a given item, continue to next
      continue;
    }

    const itemCalories = item.option.nutrition.calories;
    calculatedCalories += itemCalories * itemCount;
    amountRequiredToSelect -= itemCount;

    if (amountRequiredToSelect < 0) {
      throw new Error(
        `${Math.abs(
          amountRequiredToSelect
        )} extra item(s) have been added in calories calculation`
      );
    }
    if (amountRequiredToSelect === 0) {
      // reached our limit return
      break;
    }
    // calculate index
    const indexInfo = calculateIndex(
      optionIndex,
      sortedComboOptions.length - 1,
      isMaxCaloriesCalculation,
      isRepeat
    );
    optionIndex = indexInfo.optionIndex;
    isRepeat = indexInfo.isRepeat;
  }

  return calculatedCalories;
};

export const findCalories = (comboItem: IComboItem) => {
  // sort item based on calories
  const sortedComboItemOptions = comboItem.comboItemOptions.sort(
    sortComboItemOptions
  );

  // find Min Calories for comboItem
  const calculatedMinCalories = calculateCalories(
    sortedComboItemOptions,
    comboItem.amountRequiredToSelect
  );

  // find Max Calories for comboItem
  const calculatedMaxCalories = calculateCalories(
    sortedComboItemOptions,
    comboItem.amountRequiredToSelect,
    true
  );

  return {
    minCalories: calculatedMinCalories,
    maxCalories: calculatedMaxCalories,
  };
};
