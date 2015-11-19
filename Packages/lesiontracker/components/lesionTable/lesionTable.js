Measurements = new Meteor.Collection(null);
Timepoints = new Meteor.Collection(null);

// Activate selected lesions when lesion table row is clicked
function updateLesions(e) {
    // lesionNumber of measurement = id of row
    var lesionNumber = parseInt($(e.currentTarget).attr("id"), 10);
    var isTarget = $(e.currentTarget).find('td').eq(2).html().trim() === 'N'?false:true;

    // Find data for specific lesion
    var measurementData = Measurements.find({
        lesionNumber: lesionNumber,
        isTarget: isTarget
    }).fetch()[0];

    var timepoints = measurementData.timepoints;

    $(".imageViewerViewport").each(function(index, element) {
        // Get the timepointID related to the image viewer viewport
        // from the DOM itself. This will be changed later when a
        // real association between viewports and timepoints is created.
        var timepointID = $(element).data('timepointID');
        var timepointObject = timepoints[timepointID];

        // Defines event data
        var eventData = {
            enabledElement: cornerstone.getEnabledElement(element),
            lesionData: {
                isTarget: isTarget,
                lesionNumber: lesionNumber,
                imageId: timepointObject.imageId
            },
            type: "active"
        };

        if (timepointObject.longestDiameter === "") {
            eventData.type = "inactive";
        }

        if (!isTarget) {
            $(element).trigger("NonTargetToolSelected", eventData);

            // Deactivate lesion tool measurements
            eventData.type = "inactive";
            $(element).trigger("LesionToolSelected", eventData);
            return;
        }
        $(element).trigger("LesionToolSelected", eventData);

        // Deactivate nonTarget tool measurements
        eventData.type = "inactive";
        $(element).trigger("NonTargetToolSelected", eventData);

    });
}

Template.lesionTable.onRendered(function() {
    // Observe ViewerStudies Collection Changes
    // Note: This may not be the best place for this
    ViewerStudies.find().observe({
        added: function(study) {
            log.info('ViewerStudies added to');
            var timepointID = uuid.v4();

            var timepoint = Timepoints.findOne({timepointName: study.studyDate});
            if (timepoint) {
                log.warn("A timepoint with that study date already exists!");
                return;
            }

            Timepoints.insert({
                timepointID: timepointID,
                timepointName: study.studyDate
            });
        }
    });
});

Template.lesionTable.helpers({
    'measurement': function() {
        return Measurements.find();
    },
    'timepoints': function() {
        return Timepoints.find();
    }
});

Template.lesionTable.events({
    'click table#tblLesion tbody tr': function(e) {
        updateLesions(e);
    }
});