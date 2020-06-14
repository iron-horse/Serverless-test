export interface INutrition {
  calories: number;
  sodium: number;
  cholesterol: number;
}

export interface IItem {
  name: {
    en: string;
  };
  _type: string;
  _id: string;
  nutrition: INutrition;
}

export interface IComboItemOption {
  minAmount: number;
  maxAmount: number;
  availableAmount?: number;
  defaultAmount: number;
  option: IItem;
}

export interface IComboItem extends Omit<IItem, "nutrition"> {
  uiPattern: string;
  amountRequiredToSelect: number;
  comboItemOptions: IComboItemOption[];
}

export interface ICombo extends Omit<IItem, "nutrition"> {
  _key: string;
  comboItems: [IComboItem];
}
