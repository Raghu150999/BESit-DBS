const express = require('express');
const mysql=require('mysql');

var connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'besit',
    insecureAuth:true
  });
  
  connection.connect((err)=>
  {
    if(err)
    {
      console.log(err);
    }
    else
    {
      console.log('database connected');
    }
  }
  );
  let sql='select * from user';
  connection.query(sql,(err,result)=>{
    if(err)
    {
      console.log('error');
    }
    else
    {
      res.send();
    }
  });