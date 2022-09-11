

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require('mongoose');
const app = express();
const _=require('lodash');

mongoose.connect("mongodb+srv://ompal:Ompal@12345@cluster0.fybqn.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongodb database
const listSchema = ({
  name: String
});

const List = new mongoose.model("List", listSchema);

const list1 = new List({
  name: "Welcome to todolist"
});

const list2 = new List({
  name: "Hit + button to add item"
});

const list3 = new List({
  name: " click checkbox to delete the item"
});

var defaultArr = [list1 , list2 , list3];

const itemsSchema = ({
  name: String,
  itemsArr: [listSchema]
});

const Items = new mongoose.model("Items", itemsSchema);


app.get("/", function(req, res) {
  
  List.find({},function(err,foundList){

    if(foundList.length === 0){
      List.insertMany(defaultArr , function(err){
        if(err) 
         console.log(err);
        else 
         console.log("Inserted"); 
      });
      res.redirect("/");
    }
    else
    res.render("list", {listTitle: day, newListItems: foundList});
  })

  const day = "Today";

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const list = new List({
    name: itemName
  });

  if(listName === "Today"){
    list.save();
    res.redirect("/");
  }
  else {
    Items.findOne({name: listName},function(err, foundList){
      foundList.itemsArr.push(list);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});

app.post("/delete",function(req,res){
  const idCheckbox = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    List.deleteOne({_id: idCheckbox},function(err){
      if(err){
        console.log(err);
      }
    });
  res.redirect("/");
  }
  else{
    Items.findOneAndUpdate({name: listName},
      {$pull : {itemsArr: {_id:idCheckbox}}},
      function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
  }
   
});


app.get("/:anyName",function(req,res){
  const customListName = _.capitalize(req.params.anyName);
 
  Items.findOne({name : customListName}, function(err , foundItems){
    if(!err){
      if(!foundItems){
        console.log("do not exist");
        const item = new Items({
          name: customListName,
          itemsArr: defaultArr
        });
        item.save();
        res.redirect("/"+customListName);
      }
      else {
        //show the existing file
        res.render("list",{listTitle: foundItems.name, newListItems: foundItems.itemsArr});
      }
    }
    else {
      console.log(err);
    }
  });



})

app.get("/about", function(req, res){
  res.render("about");
});


let port=process.env.PORT;
if(port==null || port==""){
 port=3000;
}


app.listen(port, function() {
  console.log("Server started ");
});
