const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const passport = require("passport");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");

//loading config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport);

connectDB();
const app = express();

// body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//method override
app.use(
  methodOverride((req, res) => {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// handlebars helpers
const {
  dateFormat,
  truncate,
  stripTags,
  editIcon,
  select,
} = require("./helpers/hbs");

//handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { dateFormat, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport middlware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Static
app.use(express.static(path.join(__dirname, "public")));

//router
app.use("/", require("./routes/index.js"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port: ${port}`
  )
);
