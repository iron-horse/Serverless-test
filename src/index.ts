/**
 * Few assumption,
 *
 * 1. Data given in JSON file is valid and values are available for the given path
 *    for example,
 *    cart.order.items.modifier is always available not checking for null values.
 *
 */

import fs from "fs";
import { IComboItem, ICombo } from "./types";
import { findCalories } from "./utility/calculate-calories";
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

// common error handler
const errorHandler = (error: Error) => {
  // log error to find out what went wrong
  return {
    body: JSON.stringify({
      error: "Sorry could not process your request. Please try again later!",
    }),
    statusCode: 500,
  };
};

/**
 * Problem #1: Return the PLK menu
 * - Respond to `GET /menu` requests
 * - Return `./data/menu.json` on a `data` property
 *
 * Example response:
 * ```json
 * HTTP 200
 * { data: $menu }
 * ```
 */
export async function menuHandler() {
  let menu;
  try {
    menu = JSON.parse(await readFile("./src/data/menu.json"));
    return {
      body: JSON.stringify({
        data: menu,
      }),
      statusCode: 200,
    };
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * Problem #2: Map PLU to `itemId` on the user's cart
 * - Respond to `GET /cart` requests
 * - Add an `itemId` property on all items (`order.items[]`)
 *   and modifiers (`order.items[].modifiers[]`) in the cart defined
 *   by `./data/cart.json`
 * - Use the PLU to Item ID mapping in `plus.json` to determine the correct
 *   item ID for a given PLU (eg the PLU `11` has an item ID of `0`).
 * - Return the enriched cart on a `data` property
 *
 * Example response:
 * ```json
 * HTTP 200
 * {
 *   data: $enrichedCart
 * }
 * ```
 */
export async function cartHandler() {
  let cart;
  try {
    cart = JSON.parse(await readFile("./src/data/cart.json"));
    const pluData: any = JSON.parse(
      await readFile("./src/data/plus.json"),
      // nested value has stringified object.
      (_key, value) => (typeof value === "string" ? JSON.parse(value) : value)
    );

    cart.order.items = cart.order.items.map((item: any) => {
      return {
        ...item,
        itemId: pluData.data.RestaurantPosData.plus[`plu_${item.plunum}`],
        modifiers: item.modifiers.map((modifier: any) => ({
          ...modifier,
          itemId: pluData.data.RestaurantPosData.plus[`plu_${modifier.plunum}`],
        })),
      };
    });
    return {
      body: JSON.stringify({
        data: cart,
      }),
      statusCode: 200,
    };
  } catch (error) {
    return errorHandler(error);
  }
}

/**
 * Problem #3: Compute min & max calories for a 4PC chicken combo
 * - Respond to `GET /4pc-chicken/calories` requests
 * - Compute the min & max _possible_ calories for a 4 piece chicken combo,
 *   according to the nutritional information in `./data/4pc-chicken.json` (see "Combo Data Structure" below)
 * - Return the min & max calories on a `data` property
 *
 * # Combo Data Structure
 * - A combo is composed of multiple _combo items_ (`comboItems`).
 * - For each item in the combo, the user must select a number of _options_ (`comboItemOptions`) equal to the amount required by the property `amountRequiredToSelect` on the combo item.
 * - Each option for a combo item has a `minAmount` and `maxAmount`, which dictate the min & max amounts of items that may be selected. For example an item with a min amount of 1 and a max amount of 1 is guaranteed to be included once (and only once) in the combo, and an item with a min amount of 0 and a max amount of 2 may be included 0, 1, or 2 times in the combo
 * - The min and max calories is a function of these restrictions on item selection within the combo
 *
 * Example response:
 * ```json
 * HTTP 200
 * {
 *   data: {
 *     maxCalories: 9001,
 *     minCalories: 8999,
 *   }
 * }
 * ```
 */
export async function calorieCounterHandler(event: any) {
  if (event.pathParameters.menuItem !== "4pc-chicken") {
    return {
      body: JSON.stringify({
        data: "Menu item not found!",
      }),
      statusCode: 400,
    };
  }

  let calculatedCalories = {};
  try {
    const item: ICombo = JSON.parse(
      await readFile("./src/data/4pc-chicken.json")
    );
    calculatedCalories = item.comboItems.reduce(
      (prev, curr: IComboItem) => {
        const current = findCalories(curr);
        return {
          minCalories: prev.minCalories + current.minCalories,
          maxCalories: prev.maxCalories + current.maxCalories,
        };
      },
      {
        minCalories: 0,
        maxCalories: 0,
      }
    );
    return {
      body: JSON.stringify({
        data: calculatedCalories,
      }),
      statusCode: 200,
    };
  } catch (error) {
    return errorHandler(error);
  }
}
