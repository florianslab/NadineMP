// ## The following is a hack to retrieve parameters passed in the URL
// ## The script below does not make use of it, so I commented it out
//
// var Parameters = {},
//     URLParameters = window.location.search.replace("?", "").split("&");

// for (parameter in URLParameters) Parameters[URLParameters[parameter].split("=")[0]] = URLParameters[parameter].split("=")[1];

// The sequence of items (based on their labels)
var shuffleSequence = seq("consent", "counter", "audio", "instructions", "preload",
                          "mouse", sepWith(seq("sepPractice","mouse"), "practice"),
                          "preExp", "mouse", sepWith("mouse", rshuffle("indef", "filler")), 
                          "comments", "results", "debriefing");

// Show the progress bar
var showProgressBar = true;

// Don't wait the very last screen to send the results
var manualSendResults = true;

// Some default settings of the parameters
var defaults = [
    "Message",
    {
        transfer: "keypress"
    },
    "DynamicQuestion",
    {
        clickableAnswers: true,
        enabled: false
    }
];

// Indicate where to find the ZIP files containing the images and the audio samples
var zipFiles = {pictures: "http://files.lab.florianschwarz.net/ibexfiles/NadineMP/Pictures.zip",
                criticalAudio: "http://files.lab.florianschwarz.net/ibexfiles/NadineMP/CriticalModified.zip",
                fillersAudio: "http://files.lab.florianschwarz.net/ibexfiles/NadineMP/FillersModified.zip"};

// Generate a picture (cf. Python script)
var getPicture = function(character, container, topleft, topright, bottomleft, bottomright){
  return c2u.newPicture("",
                          [{id:"character", "background-image": "url('"+character+"')", "background-size": "100% 100%",
                                width: 145, height: 145, left: 40, top: 80},
                           {id:"container", "background-image": "url('"+container+"')", "background-size": "100% 100%",
                                width: 250, height: 250, left: 185, top: 25},
                           {id:"topleftItem", "background-image": "url('"+topleft+"')", "background-size": "100% 100%",
                                width: 60, height: 60, left: 240, top: 80},
                           {id:"toprightItem", "background-image": "url('"+topright+"')", "background-size": "100% 100%",
                                width: 60, height: 60, left: 310, top: 80},
                           {id:"bottomleftItem", "background-image": "url('"+bottomleft+"')", "background-size": "100% 100%",
                                width: 60, height: 60, left: 240, top: 165},
                           {id:"bottomrightItem", "background-image": "url('"+bottomright+"')", "background-size": "100% 100%",
                                width: 60, height: 60, left: 310, top: 165}],
                        {width: 450, height: 300, margin: "auto"}
                       )
};

// This is a custom controller displaying a rectangle on the screen
// and going to the next trial when the rectangle is clicked/moved over
define_ibex_controller({
    name: "MousePosition",
    jqueryWidget: {
        _init: function () {
            var t = this, o = t.options, div = $("<div>").css({width: o.w, height: o.h, top: o.y, left: o.x,
                                                position: "relative", background: "black", 
                                                margin: "-"+o.h/2+"px -"+o.w/2+"px"});
            if (typeof(o.html) != "undefined") div.html(o.html);
            t.element.append(div);
            div.bind(o.transfer, function(){ div.data("d",setTimeout(function(){o._finishedCallback();},(o.d?o.d:0)));});
            div.bind("mouseleave", function(){if(div.data("d")) clearTimeout(div.data("d"));});
        }
    },
    properties: { }
});


var items = [

    // Warn participants audio is requried, give them the opportunity to adjust their volume
    ["audio", "Message", {html: {include: "audio.html"}, transfer: "click"}],

    // Filter out participants not equipped with headphones
    //["audio", "Message", {html: {include: "HeadphoneCheck.html"}, transfer: "click"}],

    // Increment the counter (set in shuffleSequence when it should happen)
    ["counter", "__SetCounter__", {}],

    // Send the results to the server (set in shuffleSequence when it should happen))
    ["results", "__SendResults__", {}],    

    // Print a 10x10 black rectangle on the screen and move to the next trial when mouse has been over for 200ms
    ["mouse", "MousePosition", {w: "10px", h: "10px", y: "280px", transfer: "mouseenter", d: 200}],

    ["comments", "Form",  {html: {include: "ProlificFeedbackPreConfirmation.html"}}],
    
    // I use the ProlificConsentForm because it contains a field for participants to input their Prolific ID
    ["consent", "Form", {html: {include: "ProlificConsentForm.html"}, continueOnReturn: true}],
    //["consent", "Form", {html: {include: "consentForm.html"}}],

    ["debriefing", "Message", {html: {include: "Debriefing.html"}}],
    
    // Two-screen item: task-oriented instructions on the first screen, mouse instructions on the second screen
    ["instructions", "Message", {html: {include: "instructions.html"}}, "Message", {html: {include: "instructionsMouse.html"}}],     

    // This checks that the resources have been preloaded
    ["preload", "ZipPreloader", {}],
      
    ["sepPractice", "Separator", {normalMessage: "Good, let's go through a second practice trial. Press any key to continue"}],
      
    ["preExp", "Message", {html: "<div style='text-align: center;'><p>Thanks! As we continue, don't forget to evaluate "+
                                 "the sentences and your options very carefully,<br />"+
                                 "so that you can be sure to choose the right picture.</p>"+
                                 "Press any key to continue to the experiment!</p></div>" }],

    ].concat(GetItemsFrom(data, null, {
      ItemGroup: ["item", "group"],
      Elements: [
          // Label each item with the value in 'expt'
          function(x){return x.expt;},
          // Each item generated from the table is a DynamicQuestion trial
          "DynamicQuestion",
          {
              // We store the values of these cells in the results file
              legend: function(x){ return [x.item,x.expt,x.condition,x.group,x.Target,x.sentence].join("+"); },
              // Generate each picture and return them as answers
              answers: function(x){
                  return {
                          Target: getPicture(x.picTarget_person, x.picTarget_container,
                                                    x.picTarget_left_top, x.picTarget_right_top,
                                                    x.picTarget_left_bottom, x.picTarget_right_bottom),
                          // Note that Competitor constantly has 3 of its elements covered
                          Competitor: getPicture(x.pic2_person, x.pic2_container,
                                                    x.pic2_left_top, x.pic2_right_top,
                                                    x.pic2_left_bottom, x.pic2_right_bottom),
                          Distractor: getPicture(x.pic3_person, x.pic3_container,
                                                    x.pic3_left_top, x.pic3_right_top,
                                                    x.pic3_left_bottom, x.pic3_right_bottom)
                        };

              },
              // Create the triangle-table, and label the cells according to Pic*_Loc
              customAnswerModel: function(x){
                var labels = [null, null, null, null];
                labels[x.Pic1_Loc] = "Target";
                labels[x.Pic2_Loc] = "Competitor";
                labels[x.Pic3_Loc] = "Distractor";
                return $("<div>"+
                          "<table style='margin:auto; text-align:center; border-spacing: 20px 20px'>"+
                            "<tr><td id='"+labels[1]+"'></td> <td id='"+labels[2]+"''></td></tr>"+
                            // Note 'colspan=2' to have only one column in the second row
                            "<tr><td id='"+labels[3]+"' colspan='2''></td></tr>"+
                          "</table>"+
                        "</div>");
              },
             sequence: function(x){
                  if (x.item == 49){
                    return [
                      // DEBUG INFORMATION
                      //"<p style='font-size: small;'>Condition: "+x.Condition+"; Item: "+x.item+"; Group: "+x.group+"; Target: "+x.Target+"</p>",
                      // Print the triangle-table
                      {this: "answers"},
                      // Wait 1 sec
                      {pause: 1000},
                      // Play audio file
                      {audio: x.Sound_filename, type: "audio/wav", newRT: true, waitFor:true},
                      TT("#Distractor #character", "This is what a trial looks like, you'll see different characters with their items, some of them covered", "Press space and then click on the kid that you think was described by the sentence you heard", "tc"),
                      {pause: "key\x01"},
                     // Enable clicks
                      //function(t){ t.enabled = true; },
                      function(t){
                          $("#Target, #Competitor, #Distractor").bind("click", function(e){
                            if ($(this).attr("id") == "Target") TT("#Target", "Good job! On this kid's desk there are three black pencils, as mentioned in the description", "Press space to continue", "tc")(t);
                            else TT("#"+$(this).attr("id"), "No, sorry, that's wrong. You should have chosen the desk with three black pencils", "Press space continue", "tc")(t);
                          });
                      },
                      {pause: "key\x01"}
                    ];
                  }
          if (x.item == 50){
                    return [
                      // DEBUG INFORMATION
                      //"<p style='font-size: small;'>Condition: "+x.Condition+"; Item: "+x.item+"; Group: "+x.group+"; Target: "+x.Target+"</p>",
                      // Print the triangle-table
                      {this: "answers"},
                      // Wait 1 sec
                      {pause: 1000},
                      // Play audio file
                      {audio: x.Sound_filename, type: "audio/wav", newRT: true, waitFor: true},
                      TT("#Distractor #character", "This is another practice trial", "Press space and then click on the kid that you think was described by the sentence you heard", "tc"),
                      {pause: "key\x01"},
                     // Enable clicks
                      // function(t){ t.enabled = true; },
                      function(t){
                          $("#Target, #Competitor, #Distractor").bind("click", function(e){
                            if ($(this).attr("id") == "Competitor") TT("#Competitor", "Good job! Since none of the other characters have three yellow raincoats this was the right choice", "Press space to continue", "tc")(t);
                            else TT("#"+$(this).attr("id"), "No, sorry, that's wrong. You should have chosen the closet with covered items since none of the other characters have three yellow raincoats", "Press space to continue", "tc")(t);
                          });
                      },
                      {pause: "key\x01"}
                    ];
                  }
                  else {
                    return [
                      // DEBUG INFORMATION
                      //"<p style='font-size: small;'>Condition: "+x.Condition+"; Item: "+x.item+"; Group: "+x.group+"; Target: "+x.Target+"</p>",
                      // Print the triangle-table
                      {this: "answers"},
                      // Wait 1.5sec
                      {pause: 1500},
                      // Enable clicks
                      function(t){ t.enabled = true; },
                      // Play audio file
                      {audio: x.Sound_filename, type: "audio/wav", newRT: true}
                    ];
                  }
                }
          }
      ]
  }));