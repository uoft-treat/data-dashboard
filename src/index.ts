import 'babel-polyfill';


import express          from 'express';
import * as path        from 'path';
import * as dotenv      from 'dotenv';
import session          from 'express-session';
import axios            from 'axios';
import mongoose         from 'mongoose';
import {ExperimentData} from "./models/ExperimentData";
import * as bodyParser  from 'body-parser';
import cors             from 'cors';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());

app.set("view engine", "ejs");

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.use(async (req, res, next) => {
    if (req.session.iaToken) {
        let data = await axios.get(`${process.env.IA_ROOT}/api/auth_tokens/${req.session.iaToken}`, {
            headers: {
                'Authorization': `Bearer ${process.env.IA_SEC_KEY}`
            }
        });
        req.user = data.data.user;
    }
    next();
});

app.get("/", (req, res) => {
    if (req.user) {
        res.redirect("/dashboard");
    } else {
        res.render('login', {
            loginLink: process.env.IA_ROOT + "/login?id=" + process.env.IA_APP_ID,
        });
    }
});

app.get("/dashboard", (req, res) => {
    if (!req.user) {
        res.redirect("/");
    } else {
        res.render('dashboard', {
            user: req.user,
        });
    }
});

app.get('/api/data', async (req, res) => {
    res.send(await ExperimentData.find({}));
});

app.post("/api/data", async (req, res) => {

    let data = new ExperimentData();
    data.name = req.body.name;
    data.data = req.body.data;
    await data.save();

    res.send(data);

});

app.get("/login/assert", (req, res) => {
    req.session.iaToken = req.query.token;
    res.redirect("/");
});

app.use('/static', express.static(path.join(__dirname, '../static')));

app.listen(process.env.PORT, () => console.log("App open..."));

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true})
    .then(() => console.log("MongoDB connected..."));
