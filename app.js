const express = require('express');
const mongoose = require("mongoose")
const bodyParser = require('body-parser');

// let todos = []

const app=express()
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')

app.use(express.static('public'))

mongoose.connect("mongodb+srv://arun:arun123@cluster0.qgeqz.mongodb.net/todoListDb", {
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const itemsSchema = {
    name: String
}

const todo = mongoose.model("Item",itemsSchema);


const item1 = {
    name:"This is your todolist"
}
const item2 ={
    name:"click on Add to add your todo item"
}
const item3 ={
    name:"<-- click on the checkbox to delete the item u have completed"
}

const listSchema ={
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("List",listSchema);
const defaultItems = [item1,item2,item3]

const today =new Date();
const day = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const setHeader = {
    day: day[today.getDay()],
    Month: month[today.getMonth()],
    year: today.getFullYear(),
    date: today.getDate(),
    
} 
app.get('/',(req,res)=>{
    setHeader.listName = "Today";
    todo.find({},function(err,result){
        if(err) console.log(err);
        
        if(result.length ===0){
            todo.insertMany(defaultItems,(err)=>{
                if(err) console.log(err);
                else console.log("Saved to Db!");
            })
            res.redirect("/")
        }else{
            res.render('index',{todos:result,setHeader});
        }
    })

})

app.post("/",(req,res)=>{
    const item = new todo({
        name: req.body.todo
    })

    if(req.body.submit==="Today"){
        if(req.body.todo){
            item.save();
        }
        res.redirect("/");
    }else{
        List.findOne({name:req.body.submit.toLowercase()},(err,result)=>{
            if(err){
                console.log(err);
            }

            if(req.body.todo){
                result.items.push(item)
                result.save();
            }
            // console.log(result)
            res.redirect("/"+req.body.submit.toLowercase())
        })
    }
})

app.post("/delete", (req,res)=>{
    // console.log(req.body.checkbox);
    
    if(req.body.listName=="Today"){
        todo.findByIdAndRemove(req.body.checkbox,(err,result)=>{
            if(!err) console.log("succesfully deleted");
            res.redirect("/");
        });
    }
    else{
        List.findOneAndUpdate({name:req.body.listName.toLowerCase()},{$pull:{items:{_id:req.body.checkbox}}},(err,result)=>{
            if(!err) console.log("success");
            console.log(result);
            res.redirect("/"+req.body.listName);
        })
    }
   console.log(req.body.listName);
})


app.get("/:custom",(req,res)=>{
    setHeader.listName = `${req.params.custom.toUpperCase()}`
    const list =new List({
        name: req.params.custom.toLowerCase(),
        items: defaultItems
    })
    List.find({name:`${req.params.custom.toLowerCase()}`},(err,result)=>{
        // console.log(result);
        if(result.length===0){
            list.save();
            res.redirect(`/${req.params.custom.toLowerCase()}`)
        }else{
            res.render("index",{
                todos:result[0].items,
                setHeader
            })
        }
    })
})

// app.post("/")

app.listen(3000,()=>{
    console.log("logged at : http://localhost:3000");
})