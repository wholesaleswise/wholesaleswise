import CartModel from "../models/CartModel.js";
import ProductModel from "../models/ProductModel.js";

class CartController {
  // Add a product to the cart or update quantity if it exists
  static addToCart = async (req, res) => {
    try {
      const { quantity, productId } = req.body;
      const userId = req?.user?._id;

      // Check if userId is provided
      if (!userId) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized, please login first!",
        });
      }

      // Validate quantity and productId
      if (!quantity || !productId) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide both quantity and productId",
        });
      }

      // Check if the product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: "failed",
          message: "Product not found",
        });
      }

      if (product.productTotalStockQty === 0) {
        return res.status(400).json({
          status: "failed",
          message: `${product.productName} is out of stock.`,
        });
      }

      // Check if the product already exists in the user's cart
      let cartItem = await CartModel.findOne({ userId, productId });

      //  Calculate total requested quantity
      const stackedQuantity = cartItem
        ? cartItem.quantity + quantity
        : quantity;

      if (stackedQuantity > product.productTotalStockQty) {
        return res.status(400).json({
          status: "failed",
          message: `Only ${
            product.productTotalStockQty
          } items are in stock. You already have ${
            cartItem?.quantity || 0
          } in your cart.`,
        });
      }

      //  Update or create cart item
      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save();
      } else {
        cartItem = new CartModel({
          userId,
          quantity,
          productId,
        });
        await cartItem.save();
      }

      //  Fetch updated cart item with populated product details
      const updatedCartItem = await CartModel.findOne({
        _id: cartItem._id,
      }).populate({
        path: "productId",
        select:
          "productName productDescription productPrice productImageUrls discount numReviews rating productTotalStockQty SKU",
        populate: {
          path: "category",
          select: "categoryName categoryImage",
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Product added to cart successfully",
        data: updatedCartItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message:
          error.message ||
          "An error occurred while adding the product to the cart",
      });
    }
  };

  // Get all cart items for the current user
  static getMyCarts = async (req, res) => {
    try {
      const userId = req?.user?._id;
      // Check if userId is provided
      if (!userId) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized, please login first!",
        });
      }

      const cartItems = await CartModel.find({ userId }).populate({
        path: "productId",
        select:
          "productName productDescription productPrice productImageUrls discount numReviews rating productTotalStockQty SKU ",
        populate: {
          path: "category",
          select: "categoryName categoryImage",
        },
      });
      const validCartItems = cartItems.filter(
        (item) => item.productId !== null
      );
      return res.status(200).json({
        status: "success",
        message: "Cart items fetched successfully",
        data: validCartItems,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message: error.message || "An error occurred while fetching cart items",
      });
    }
  };

  // Delete a specific item from the user's cart
  static deleteMyCartItem = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req?.user?._id;

      // Validate that userId and productId are present
      if (!productId) {
        return res.status(400).json({
          status: "failed",
          message: "Product is required",
        });
      }
      if (!userId) {
        return res.status(400).json({
          status: "failed",
          message: "Unauthorized, please login first!",
        });
      }

      // Check if the product exists in the cart for the given user
      const cartItem = await CartModel.findOne({ userId, productId });
      if (!cartItem) {
        return res.status(404).json({
          status: "failed",
          message: "Product not found in your cart",
        });
      }

      // Delete the cart item
      await CartModel.deleteOne({ userId, productId });

      // Send success response
      return res.status(200).json({
        status: "success",
        message: "Product removed from cart successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message:
          error.message ||
          "An error occurred while deleting the product from the cart",
      });
    }
  };

  //  Delete all item from the user's cart

  static deleteAllCartItems = async (req, res) => {
    try {
      const userId = req?.user?._id;

      if (!userId) {
        return res.status(400).json({
          status: "failed",
          message: "Unauthorized, please login first!",
        });
      }

      const result = await CartModel.deleteMany({ userId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          status: "failed",
          message: "No products found in your cart",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "All products removed from cart successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message:
          error.message ||
          "An error occurred while deleting all products from the cart",
      });
    }
  };

  // Update the quantity of a product in the cart
  static updateCartItem = async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req?.user?._id;

      // Check if userId is provided
      if (!userId) {
        return res.status(401).json({
          status: "failed",
          message: "Unauthorized, please login first!",
        });
      }

      // Validate quantity
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          status: "failed",
          message: "Please provide a valid quantity",
        });
      }
      // Check if the product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res.status(404).json({
          status: "failed",
          message: "Product not found",
        });
      }
      // Check if the requested quantity exceeds the product's available stock
      if (product.productTotalStockQty === 0) {
        return res.status(400).json({
          status: "failed",
          message: `${product.productName} is out of stock.,`,
        });
      }
      // Check if the requested quantity exceeds the product's available stock
      if (quantity > product.productTotalStockQty) {
        return res.status(400).json({
          status: "failed",
          message: ` only ${product.productTotalStockQty} items are in stock.`,
        });
      }
      // Check if the cart item exists
      const cartItem = await CartModel.findOne({ userId, productId });
      if (!cartItem) {
        return res.status(404).json({
          status: "failed",
          message: "Product not found in your cart",
        });
      }

      // Update the quantity
      cartItem.quantity = quantity;
      await cartItem.save();

      return res.status(200).json({
        status: "success",
        message: "Cart item quantity updated successfully",
        data: cartItem,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: "failed",
        message:
          error.message ||
          "An error occurred while updating the cart item quantity",
      });
    }
  };
}

export default CartController;
