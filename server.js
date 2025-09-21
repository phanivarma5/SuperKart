import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoute.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import groupCartRoutes from './routes/groupCartRoutes.js';
import deliverySlotRoutes from './routes/deliverySlotRoutes.js';

dotenv.config();

connectDB();

const app = express();
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use ("/api/v1/auth",authRoutes);
app.use ("/api/v1/category",categoryRoutes);
app.use("/api/v1/product",productRoutes);
app.use('/api/v1/group-carts', groupCartRoutes);
app.use('/api/v1/delivery-slots', deliverySlotRoutes);

app.get('/', (req,res) => {
    res.send("<h1>Welcome to Ecommerce App</h1>");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`server is running on ${process.env.DEV_MODE} mode on port ${PORT}`);
});