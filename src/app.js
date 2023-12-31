import express from "express";
import mongoose from "mongoose";
import passport from "passport";

import { engine } from "express-handlebars";
import * as path from "path";
import MongoStore from "connect-mongo";
import session from "express-session";
import FileStore from "session-file-store";

import "../src/db/db.config.js";
import __dirname from "./utils.js";

import dotenv from 'dotenv';
dotenv.config();

import prodRouter from "../src/routes/product.router.js";
import cartRouter from "../src/routes/cart.router.js";
import userRouter from "../src/routes/user.router.js";

import initializePassport from '../src/config/passport.config.js'
import ProductManager from "./dao/ProductManager.js";
import CartManager from "./dao/CartManager.js";

initializePassport(passport);

const app = express();

const PORT = process.env.PORT || 8080;
const product = new ProductManager();
const cart = new CartManager();
const fileStorage = FileStore(session);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, 
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 3600,
    }),
    secret: process.env.SESSION_SECRET || "SecretPassword", 
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"));

app.use("/", express.static(__dirname + "/public"));

app.use("/api", prodRouter);
app.use("/api", cartRouter);
app.use("/api/sessions", userRouter);

app.get("/", async (req, res) => {
    const allProducts = await product.getProducts();
    const productData = allProducts.map(product => product.toJSON());
    const page = parseInt(req.query.page) || 1;

    const user = {
        first_name: req.session.firstName,
        last_name: req.session.lastName,
        rol: req.session.rol,
    };

    console.log("User object:", user);
    res.render("home", {
        title: "Vista Products",
        products: productData,
        page: page,
        user: user,  
    });
});

app.get('/api/sessions/register', async (req, res) => {
    res.render('register', { title: 'Register' });
  });
  
  app.get('/api/sessions/login', async(req, res) => {
    res.render('login', { title: 'Login' });
  });
 
  app.get('/api/sessions/profile', async(req, res) => {
    try {
      const user = {
        first_name: req.session.firstName,
        last_name: req.session.lastName,
        email: req.session.emailUser,
        age: 30,
        rol: req.session.rol,
      };
  
      res.render('profile', user);
    } catch (error) {
      console.error('Error al acceder al perfil:', error);
      res.status(500).send('Error al acceder al perfil');
    }
  });

app.get("/carts/:cid", async (req, res) => {
    let id = req.params.cid
    let allCarts  = await cart.getCartWithProducts(id)
    res.render("viewCart", {
        title: "Vista Cart",
        carts : allCarts
    });
});

mongoose
  .connect(process.env.MONGO_URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Mongo");
  })
  .catch((error) => {
    console.error("Error connecting to Mongo, error" + error);
  });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
