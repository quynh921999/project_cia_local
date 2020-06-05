// /**
//  * Object quản lí Detail View Cho phép thay đổi thuộc tính của attribute, method
//  * hoặc class và upload lên changeset
//  */
//
// var PropertyView = {
//    view: {},
//    createView: function(){
//         this.view = View.newView("Detail",'.attribute-view', false);
//         this.clickedPARAMETER = -1;
//    },
//    /***/
//    updateNewNode: function(data){
//         var changedNode = {id: data.id, kind: data.kind, changes: {}};
//         var cloneData = jQuery.extend({},data);
//         PropertyView.update(cloneData, changedNode);
//    },
//    /**
//      * Cập nhật lại view
//      */
//    update: function(data, changedNode){
//         PropertyView.view.selectAll('table').remove();
//         PropertyView.view.selectAll('div').remove();
//         var form = PropertyView.view.append('table').attr("class","attribute-table");
//         // Name textBox
//         changedNode.changes.name = data.name;
//         var name = form.append("tr");
//         name.append("td").attr("class","col-1").style("text-align","right").html("Name");
//         name.append("td").attr("class","col-2").append("input")
//             .attr("type","text")
//             .attr("value",data.name)
//             .on("change",function(){
//                    data.name = d3.select(this)[0][0].value;
//                    changedNode.changes.name = d3.select(this)[0][0].value;
//             });
//       // Type textbox
//         if(data.type){
//             changedNode.changes.type = data.type;
//             var type = form.append("tr");
//             type.append("td").attr("class","col-1").html("Type");
//             type.append("td").attr("class","col-2").append("input")
//                 .attr("type","text")
//                 .attr("value",data.type)
//                 .on("change",function(){
//                     data.type = d3.select(this)[0][0].value;
//                     changedNode.changes.type = d3.select(this)[0][0].value;
//                 });
//         }
//
//        // Visibility selection
//        changedNode.changes.visibility = data.visibility;
//        var visibility = form.append("tr");
//        visibility.append("td").attr("class","col-1").html("Visibility");
//        var select = visibility.append("td").attr("class","col-2").append("select");
//        select.selectAll('option').data(VISIBILITY).enter().append("option").html(function(d,i){return d;});
//        select.property("value",data.visibility);
//        select.on("change",function(d,i){
//            data.visibility = d3.select(this)[0][0].value;
//             changedNode.changes.visibility = select.property("value");
//        });
//
//        // Interface checkbox disable
//        if(data.isInterface!=undefined){
//             var isInterface = form.append("tr");
//             isInterface.append("td").attr("class","col-1").html("isInterface");
//             isInterface.append("td").attr("class","col-2").append("input")
//                 .attr("type","checkbox")
//                 .property("checked",data.isInterface).attr('disabled','disabled');
//        }
//        // Static checkbox
//        if(data.isStatic!=undefined){
//             changedNode.changes.isStatic = data.isStatic;
//             var isStatic = form.append("tr");
//             isStatic.append("td").attr("class","col-1").html("isStatic");
//             isStatic.append("td").attr("class","col-2").append("input")
//                 .attr("type","checkbox")
//                 .property("checked",data.isStatic)
//                 .on("change",function(d,i){
//                     data.isStatic = d3.select(this)[0][0].value;
//                      changedNode.changes.isStatic = d3.select(this)[0][0].checked;
//                 });
//        }
//        // Abstract checkbox disable
//        if(data.isAbstract!=undefined){
//             var isAbstract = form.append("tr");
//             isAbstract.append("td").attr("class","col-1").html("isAbstract");
//             isAbstract.append("td").attr("class","col-2").append("input")
//                 .attr("type","checkbox")
//                 .property("checked",data.isAbstract).attr('disabled','disabled');
//       }
//       // Final checkbox
//       var isFinal = form.append("tr");
//         changedNode.changes.isFinal = data.isFinal;
//         isFinal.append("td").attr("class","col-1").html("isFinal");
//         isFinal.append("td").attr("class","col-2").append("input")
//             .attr("type","checkbox")
//             .property("checked",data.isFinal)
//             .on("change",function(d,i){
//                 data.isFinal = d3.select(this)[0][0].value;
//                  changedNode.changes.isFinal = d3.select(this)[0][0].checked;
//             });
//       // PARAMETER List
//        if(data.parameter||data._parameter){
//             changedNode.changes.return = data.return;
//             var returnType = form.append("tr");
//             returnType.append("td").attr("class","col-1").html("Return");
//             returnType.append("td").attr("class","col-2").append("input")
//                 .attr("type","text")
//                 .attr("value",data.return)
//                 .on("change",function(d,i){
//                     data.return = d3.select(this)[0][0].value;
//                     changedNode.changes.return = d3.select(this)[0][0].checked;
//                 }) ;
//             changedNode.changes.parameter = data.parameter||data._parameter;
//             var parameters = form.append("tr");
//             var col_1_parameter = parameters.append("td").attr("class","col-1")
//             col_1_parameter.append('span').append('small')
//                     .attr("class",function(){
//                         if(data.parameter) return "glyphicon glyphicon-chevron-down";
//                         else if(data._parameter) return "glyphicon glyphicon-chevron-right"
//                         else return "";
//                     })
//                     .attr("aria-hidden","true").style("color","white");
//             col_1_parameter.append('span').html(" PARAMETER");
//             col_1_parameter.on("click",function(){
//                     if(data.parameter){
//                         data._parameter = data.parameter;
//                         data.parameter = null;
//                         PropertyView.update(data, changedNode);
//                     }
//                     else if(data._parameter){
//                         data.parameter = data._parameter;
//                         data._parameter = null;
//                         PropertyView.update(data, changedNode);
//                     }
//             })
//             var col_2_parameter = parameters.append("td").attr("class","col-2");
//             col_2_parameter.append('span').html(function(){
//               if(data.parameter) return "("+data.parameter.length+")";
//               if(data._parameter) return "("+data._parameter.length+")";
//             });
//            col_2_parameter.append('span')
//                .attr("class","glyphicon glyphicon-plus pull-right")
//                .attr("aria-hidden","true").style("color","white")
//                .on('click',function(){
//                      if(!data.parameter){
//                        data.parameter = data._parameter;
//                        data._parameter = null;
//                      }
//                      data.parameter.unshift({name: "",type: ""});
//                      PropertyView.clickedPARAMETER = 0;
//                      changedNode.changes.parameter = data.parameter;
//                      PropertyView.update(data, changedNode);
//                });
//            if(data.parameter) data.parameter.forEach(function(d,i){
//
//                var row  = form.append("tr");
//                row.append("td").attr("class","col-1").html();
//                var col_2 = row.append("td").attr("class","col-2").style("font-style","italic").style("font-weight","lighter");
//                var name = col_2.append("span").html((i+1)+". "+d.name+"  ");
//                col_2.on("click",function(){
//                    if(PropertyView.clickedPARAMETER != i)PropertyView.clickedPARAMETER = i;
//                    else PropertyView.clickedPARAMETER = -1;
//                    PropertyView.update(data, changedNode);
//                });
//                var remove = col_2.append("span").attr("class","glyphicon glyphicon-remove pull-right").attr("aria-hidden","true").style("color","#ff2222");
//                remove.on("click",function(para,paraIndex){
//                    data.parameter.splice(data.parameter.indexOf(d),1);
//                    changedNode.changes.parameter = data.parameter;
//                    PropertyView.update(data, changedNode);
//                });
//                if(PropertyView.clickedPARAMETER==i){
//                  var name = form.append("tr");
//                  name.append("td").attr("class","col-1").attr("id","parameter").html("name");
//                  name.append("td").attr("class","col-2").append("input")
//                        .attr("type","text")
//                        .attr("value",d.name)
//                        .attr('placeholder',"name")
//                        .on("change", function(){
//                            data.parameter[i].name = d3.select(this)[0][0].value;
//                            changedNode.changes.parameter = data.parameter;
//                        });
//                  var type = form.append("tr");
//                  type.append("td").attr("class","col-1").attr("id","parameter").html("type");
//                  type.append("td").attr("class","col-2").append("input")
//                      .attr("type","text")
//                      .attr("value",d.type)
//                      .attr('placeholder',"type")
//                      .on("change", function(){
//                             data.parameter[i].type = d3.select(this)[0][0].value;
//                             changedNode.changes.parameter = data.parameter;
//                     });
//                }
//            });
//        }
//        form.append("tr").attr("class","spacer").append("td").attr("class","col-1").html("&nbsp;");
//        var buttons = PropertyView.view.append("div");
//        buttons.append("button").attr("class","accept-button").html("OK").attr("type","button")
//                 .on("click", function(){
//                     Data.updateData(data);
//                     ChangeSetView.update(changedNode);
//                     ClassView.updateNode(data.classID);
//                 });
//        buttons.append("button").attr("class","default-button").html("Reset").attr("type","button")
//                 .on("click", function(){
//                     Data.removeChange(data.id);
//                     ChangeSetView.display();
//                     var originData = Data.resetToOrigin(data.id);
//                     Data.updateData(originData);
//                     PropertyView.updateNewNode(originData);
//                     ClassView.updateNode(data.classID);
//                 });
//        buttons.append("button").attr("class","cancel-button").html("Cancel").attr("type","button")
//                .on("click", function(){
//                     PropertyView.updateNewNode(Data.getNodeById(data.id));
//                 });
//    }
// }
