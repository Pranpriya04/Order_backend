require('dotenv').config(); //require เอาไว้เรียก library ต้องมี .config() ต่อ
const express = require('express'); 
const Sequelize = require('sequelize');
const Categorys_data = require('./data/categorys.json');
const Products_data = require('./data/products.json');
const Status_data = require('./data/status.json');
const app = express(); 
const PORT = process.env.PORT || 3000;

app.use(express.json());  //.use ใช้libraryตัวเอง set ใช้ของอันอื่น

const seq = new Sequelize("database","username","password",{
    host: "localhost",
    dialect: "sqlite",
    storage: "./database/Orders.sqlite",
})

const Categorys = seq.define("categorys",{
    category_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    category_name:{
        type: Sequelize.STRING,
        allowNull: false
    }
    
});

const Status = seq.define("statuses",{
    status_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    status_name:{
        type: Sequelize.STRING,
        allowNull: false
    }
    
});

const Products = seq.define("products",{
    product_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey:true
    },
    product_name:{
        type: Sequelize.STRING,
        allowNull: false
    },
    product_amount:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    product_price:{
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    category_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    status_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

Products.belongsTo(Categorys,{ //m-1
    foreignKey:"category_id"
})
Categorys.hasMany(Products,{ //1-m
    foreignKey:"category_id" 
})
Status.hasMany(Products,{
    foreignKey:"status_id"
})
Products.belongsTo(Status,{
    foreignKey:"status_id"
})

seq.sync();

app.get("/insertcategory",(req,res)=>{
    Categorys_data.map(function (row) {
        console.log(row);
        Categorys.create(row);
    })
    res.end()
});
app.get("/insertstatus",(req,res)=>{
    Status_data.map(function(row) {
        console.log(row);
        Status.create(row);
    })
    res.end();
});
app.get("/insertproduct",(req,res)=>{
    Products_data.map(function (row) {
        console.log(row);
        Products.create(row);
    })
    res.end();
})

app.get("/",(req,res)=>{
    res.status(200).json("หิวข้าว");
});

app.get("/categorys",(req,res)=>{ //"/categorys"ชื่อ table
    Categorys.findAll() //Categorysชื่อตัวแปร
    .then((row)=>{  //rowข้อมูลที่ได้กลับมา
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.get("/categorys/:category_id",(req,res)=>{
    // Categorys.findByPk(req.params.category_id)
    Categorys.findOne({
        where:{
            category_id:req.params.category_id,
        }  
    })
    .then((row)=>{  //rowข้อมูลที่ได้กลับมา
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

// app.get("/categorys/:category_id",(req,res)=>{
//     Categorys.findByPk(req.params.category_id)
//     .then((row)=>{  //rowข้อมูลที่ได้กลับมา
//         res.status(200).json(row)
//     })
//     .catch((err)=>{
//         res.status(200).json(err)
//     })
// })

app.post("/categorys",(req,res)=>{
    Categorys.create(req.body)
    .then((row)=>{  //rowข้อมูลที่ได้กลับมา
        res.status(200).json({
            status: true,
            row: row
        })
    })
    .catch((err)=>{
        res.status(200).json(err)
    })

});
 ///categorys/:category_name ส่งแบบ req.params.category_name

app.put("/categorys/:category_id",(req,res)=>{
    Categorys.findByPk(req.params.category_id)
    .then((categorys)=>{  
        categorys.update(req.body)
        .then((row)=>{  
            res.status(200).json(row)
        })
        .catch((err)=>{
            res.status(200).json(err)
        })
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.delete("/categorys",(req,res)=>{
    // Categorys.findByPk(req.params.category_id)
    // .then((categorys)=>{  
    //     categorys.destroy()
    //     .then(() => {
    //       res.send({});
    //     })
    //     .catch((err) => {
    //       res.status(500).send(err);
    //     });
    // })
    // .catch((err)=>{
    //     res.status(200).json(err)
    // })
    Categorys.findByPk(req.query.category_id)
    .then((categorys)=>{
        categorys.destroy()
        .then(() => {
          res.send({});
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    })
    .catch((err)=>{
        res.status(200).json(err)
    })

});


app.get("/products",(req,res)=>{ 
    Products.findAll({
       include:[{
        model: Categorys,
        attributes:["category_name"]
       },
       {
        model: Status,
        attributes:["status_name"]
       }]
    }) 
    .then((row)=>{  
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.get("/products/:product_id",(req,res)=>{
    // Categorys.findByPk(req.params.category_id)
    Products.findOne({
        where:{
            product_id:req.params.product_id,
        },
        include:[{
            model: Categorys,
            attributes:["category_name"]
           }]
        
    })
    .then((row)=>{  
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.post("/products",(req,res)=>{
    Products.create(req.body)
    .then((row)=>{ 
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })

});

app.put("/products/:product_id",(req,res)=>{
    Products.findByPk(req.params.product_id)
    .then((products)=>{  
        products.update(req.body)
        .then((row)=>{  
            res.status(200).json(row)
        })
        .catch((err)=>{
            res.status(200).json(err)
        })
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.delete("/products",(req,res)=>{
    Products.findByPk(req.query.product_id)
    .then((products)=>{
        products.destroy()
        .then(() => {
          res.send({});
        })
        .catch((err) => {
          res.status(500).send(err);
        });
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.get("/statuses",(req,res)=>{ 
    Status.findAll() 
    .then((row)=>{ 
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});
app.get("/statuses/:statuses_id",(req,res)=>{
    Status.findOne({
        where:{
            statuses_id:req.params.statuses_id,
        }  
    })
    .then((row)=>{  //rowข้อมูลที่ได้กลับมา
        res.status(200).json(row)
    })
    .catch((err)=>{
        res.status(200).json(err)
    })
});

app.listen(PORT,()=>{
    console.log(`Sever run on port ${PORT}`);
});