// This example code illustrates how to render publicly visible products
// directly to a browser.

var product; // to hold one pijaz work product

$(function() {

  // Default parameter values for synthesizing a pijaz product. Every
  // product can support an arbitrary number of user configurable parameters.
  // These values can be changed manually or programmatically to alter the image.
  var initialDefaults = {
    message: "Hello World",       // message to show.  used by all example products

    // These other parameters are only used by the 'torn paper' product.
    font: "African",              // try: Helvetica, Airstream, ArmyChalk, BALL, Ballade, Splurge
    pitch: 30,                    // spiral text pitch.
    revolutions: 35,              // text revolution count.
    'background-point-size': 24,  // point size for spiral text
    'title-point-size': 90        // point size for foreground text
  };

  product = new PijazProduct({
    serverManager: new PijazServerManager({
      renderServer: PijazRenderServer,
      apiServer: PijazApiServer
    }),
    previewManager: new PijazPreviewManager({ previewNode: $("#pijaz-preview")}),
    renderParameters: initialDefaults,
    workflowId: "web.12"          // Initial workflow ID.
  });

  // Controls manage all of the necessary communications to the pijaz servers
  // when a control value changes. The key is both the parameter name supported
  // by the product and the id of the control element to change that key
  //
  // Try adding controls for some of the other parameters above. Remember
  // to add a control in the HTML code below as well.

  product.addSimpleControl({ key : 'message' });
  product.addSimpleControl({ key : 'workflowId' });
  product.updatePreview();  // draw initial product using default values.
});

