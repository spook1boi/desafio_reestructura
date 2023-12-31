import { Router } from "express";
import productController from "../dao/ProductManager.js";

const prodRouter = Router();
const product = new productController();

prodRouter.get("/products/:pid", async (req, res) => {
    try {
        const prodId = req.params.pid;
        const productDetails = await product.getProductById(prodId);
        if (productDetails === 'Product not found') {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.render('viewProducts', { layout: 'main', product: productDetails });
        }
    } catch (error) {
        console.error('Error getting the product:', error);
        res.status(500).json({ error: 'Error getting the product' });
    }
});

prodRouter.get("/products/category/:category", async (req, res) => {
    const category = req.params.category;
  
    try {
      const products = await product.getProductsByCategory(category);
  
      if (products.length === 0) {
        res.status(404).json({ error: 'No se encontraron productos en la categoria proporcionada.' });
      } else {
        res.json(products);
      }
    } catch (error) {
      console.error('Error al obtener productos por categoria:', error);
      res.status(500).json({ error: 'Error al obtener productos por categoria' });
    }
  });

prodRouter.get("/products/limit/:limit", async (req, res) => { 
    let limit = parseInt(req.params.limit)
    if (isNaN(limit) || limit <= 0) {
        limit = 10;
    }    
    res.send(await product.getProductsByLimit(limit))
})

prodRouter.get("/products/page/:page", async (req, res) => {
    const page = parseInt(req.params.page);
    if (isNaN(page) || page <= 0) {
        return res.status(400).json({ error: 'Invalid page number' });
    }
    const productsPerPage = 10; 
    try {
        const products = await product.getProductsByPage(page, productsPerPage);
        res.json(products);
    } catch (error) {
        console.error('Error getting products by page:', error);
        res.status(500).json({ error: 'Error getting products by page' });
    }
});

prodRouter.put("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    const updProd = req.body;
    res.send(await product.updateProduct(pid, updProd));
});


prodRouter.get("/products/search/query", async (req, res) => {
    const query = req.query.q;
    res.send(await product.getProductsByQuery(query));
});


prodRouter.post("/products", async (req, res) => {
    const newProduct = req.body;
    res.send(await product.addProduct(newProduct));
});

prodRouter.delete("/products/:pid", async (req, res) => {
    const pid = req.params.pid;
    res.send(await product.delProducts(pid));
});

prodRouter.get("/products", async (req, res) => {
    let sortOrder = req.query.sortOrder; 
    let category = req.query.category; 
    let availability = req.query.availability; 
    if(sortOrder === undefined){
        sortOrder = "asc"
    }
    if(category === undefined){
        category = ""
    }
    if(availability === undefined){
        availability = ""
    }
    res.send(await product.getProductsMaster(null,null,category,availability, sortOrder))
})


export default prodRouter;