// ## The following is a hack to retrieve parameters passed in the URL
// ## The script below does not make use of it, so I commented it out
//
// var Parameters = {},
//     URLParameters = window.location.search.replace("?", "").split("&");

// for (parameter in URLParameters) Parameters[URLParameters[parameter].split("=")[0]] = URLParameters[parameter].split("=")[1];

// The sequence of items (based on their labels)
var shuffleSequence = seq("instructions", "preload", sepWith("sepPractice", "practice"), "preExp", rshuffle("indef", "filler"));

// Show the progress bar
var showProgressBar = true;

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
                audio: "http://files.lab.florianschwarz.net/ibexfiles/NadineMP/Audio.zip"};

// Generate a picture (cf. Python script)
var getPicture = function(character, container, topleft, topright, bottomleft, bottomright){
  return c2u.newPicture("",
                          [{id:"character", background: "url('"+character+"')", "background-size": "cover",
                                width: 145, height: 145, left: 40, top: 80},
                           {id:"container", background: "url('"+container+"')", "background-size": "cover",
                                width: 250, height: 250, left: 185, top: 25},
                           {id:"topleftItem", background: "url('"+topleft+"')", "background-size": "cover",
                                width: 60, height: 60, left: 240, top: 80},
                           {id:"toprightItem", background: "url('"+topright+"')", "background-size": "cover",
                                width: 60, height: 60, left: 310, top: 80},
                           {id:"bottomleftItem", background: "url('"+bottomleft+"')", "background-size": "cover",
                                width: 60, height: 60, left: 240, top: 165},
                           {id:"bottomrightItem", background: "url('"+bottomright+"')", "background-size": "cover",
                                width: 60, height: 60, left: 310, top: 165}],
                        {width: 450, height: 300, margin: "auto"}
                       )
}

var items = [
      
    ["instructions", "Message", {html: {include: "instructions.html"}}],
      
    ["instructions", "Message", {html: "<p>To continue to the tutorial, press any key on the keyboard.</p>"+
                                "<p>If you have any questions, feel free to ask the experimenter after the practice trials.</p>"}],

    // This checks that the resources have been preloaded
    ["preload", "ZipPreloader", {}],
      
    ["sepPractice", "Separator", {normalMessage: "Good, let's go through a second practice trial."}],
      
    ["preExp", "Message", {html: "<div style='text-align: center;'><p>Thanks! As we continue, don't forget to evaluate "+
                                 "the sentences and your options very carefully,<br />"+
                                 "so that you can be sure to choose the right picture.</p>"+
                                 "<p>Let's continue the experiment!</p>"+
                                 "<p style='margin-top: 2em;'>IMPORTANT NOTE: Before each trial, you'll see a dot in the middle of the screen.<br />"+
                                 "Please look at this dot while it's being displayed, so that the trial can begin.<br />"+
                                 "Once the pictures are shown, you can look around at the images at your will.</p></div>" }],

    ].concat(GetItemsFrom(data, null, {
      ItemGroup: ["item", "group"],
      Elements: [
          // Label each item with the value in 'expt'
          function(x){return x.expt;},
          // Each item generated from the table is a DynamicQuestion trial
          "DynamicQuestion",
          {
              // We store the values of these cells in the results file
              legend: function(x){ return [x.item,x.expt,x.condition,x.group,x.TargetPic_type,x.sentence].join("+"); },
              // Generate each picture and return them as answers
              answers: function(x){
                  return {
                          Target: getPicture(x.picTarget_person, x.picTarget_container,
                                                    x.picTarget_left_top, x.picTarget_right_top,
                                                    x.picTarget_left_bottom, x.picTarget_right_bottom),
                          // Note that Competitor constantly has 3 of its elements covered
                          Competitor: getPicture(x.pic2_person, x.pic2_container,
                                                    "CoveredBox.png", x.pic2_right_top,
                                                    "CoveredBox.png", "CoveredBox.png"),
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
                          "<table style='margin:auto; text-align:center; border-spacing: 20px 0px'>"+
                            "<tr><td id='"+labels[1]+"'></td> <td id='"+labels[2]+"''></td></tr>"+
                            // Note 'colspan=2' to have only one column in the second row
                            "<tr><td id='"+labels[3]+"' colspan='2''></td></tr>"+
                          "</table>"+
                        "</div>");
              },
              sequence: function(x){
                  return [
                      // DEBUG INFORMATION
                      "<p style='font-size: small;'>Condition: "+x.Condition+"; Item: "+x.item+"; Group: "+x.group+"; Target: "+x.Target_pic+"</p>",
                      // Print the triangle-table
                      {this: "answers"},
                      // Wait 1 sec
                      {pause: 1000},
                      // Enable clicks
                      function(t){ t.enabled = true; },
                      // Play audio file
                      {audio: x.Sound_filename, type: "audio/wav", newRT: true}
                    ];
                }
          }
      ]
  }));