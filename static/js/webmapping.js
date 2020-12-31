window['onload'] = init;

function init() {
    //init list trajectory
    const getTrajList = $(".trajline");
    const list_traj = []
    for (let i = 1; i <= getTrajList.length; i++) {
        let temp_traj = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                ratio: 1,
                url: 'http://localhost:8080/geoserver/trajectory/wms',
                params: {
                    'VERSION': '1.1.1',
                    LAYERS: 'trajectory:trajline_' + i,
                },
            }),
            title: "" + i,
            visible: false,
        });
        list_traj.push(temp_traj);
    }
//map attribute
    const osm = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    const view = new ol.View({
        // center: [11875016.021677138, 1205364.5582473525],
        center: ol.proj.fromLonLat([106.65, 10.7]),
        zoom: 10,
        minZoom: 8,
        extent: [10333531.601579724, 919540.3712809414, 13092784.454454564, 2697540.9147418556],
    });
    const trajLayerGroup = new ol.layer.Group({
        layers: list_traj,
    });

//get list outlier
    const outlierTraj = []
    const getList = $(".outlier");
    for (let i = 1; i <= getTrajList.length; i++) {
        let temp_traj = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                ratio: 1,
                url: 'http://localhost:8080/geoserver/trajectory/wms',
                params: {
                    'VERSION': '1.1.1',
                    LAYERS: 'trajectory:outlier_' + i,
                },
            }),
            title: "" + i,
            visible: false,
        });
        outlierTraj.push(temp_traj);
    }
    // for (let i of getList) {
    //     trajLayerGroup.getLayers().forEach(function (element) {
    //         if (i.id === element.get('title')) {
    //             outlierTraj.push(element);
    //         }
    //     })
    // }
    // console.log(outlierTraj.length)
    const outlierGroup = new ol.layer.Group({
        layers: outlierTraj,
    })

//Map view
    const map = new ol.Map({
        view: view,
        layers: [
            osm,
            // countryShape,
            trajLayerGroup,
            outlierGroup,
        ],
        target: 'map',//div id
    });

//get coordinate by click
    const popupHeadElement = document.getElementById('popup-head');
    const popupHead = new ol.Overlay({
        element: popupHeadElement,
        positioning: 'bottom-right'
    });
    const popupTailElement = document.getElementById('popup-tail');
    const popupTail = new ol.Overlay({
        element: popupTailElement,
        positioning: 'bottom-right'
    });
    map.addOverlay(popupHead);
    map.addOverlay(popupTail);

    //search word
    $("#my-input").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        $("#body-content tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


    $("#my-input-outlier").on("keyup", function () {
        const value = $(this).val().toLowerCase();
        $("#body-outlier tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    $("#select-all").click(function () {
        const selectedCheckbox = document.querySelectorAll(".first-column > label > input[type=checkbox]");
        $(selectedCheckbox).prop('checked', this.checked);
    });
    $("#all-outlier").click(function () {
        const selectedCheckbox = document.querySelectorAll(".first-column-outlier > label > input[type=checkbox]");
        $(selectedCheckbox).prop('checked', this.checked);
    });
    $("#header1").click(function () {
        sortTable(4);
    });
    $("#header2").click(function () {
        sortTable(5);
    });

//get lon and lat
    class Coordinate {
        constructor(lon, lat) {
            this.lon = lon;
            this.lat = lat;
        }
    }

    const headCoordinateList = []
    const tailCoordinateList = []
    for (let i = 1; i <= list_traj.length; i++) {
        let str_lat_head = '#lat_head' + i;
        let str_lon_head = '#lon_head' + i;
        let str_lat_tail = '#lat_tail' + i;
        let str_lon_tail = '#lon_tail' + i;
        let temp_lat_head = parseFloat(document.querySelectorAll(str_lat_head)[0].innerHTML);
        let temp_lon_head = parseFloat(document.querySelectorAll(str_lon_head)[0].innerHTML);
        let temp_lat_tail = parseFloat(document.querySelectorAll(str_lat_tail)[0].innerHTML);
        let temp_lon_tail = parseFloat(document.querySelectorAll(str_lon_tail)[0].innerHTML);
        let temp_coor_head = new Coordinate(temp_lon_head, temp_lat_head);
        let temp_coor_tail = new Coordinate(temp_lon_tail, temp_lat_tail);
        headCoordinateList.push(temp_coor_head);
        tailCoordinateList.push(temp_coor_tail);
    }

//select all layer
    selectAll('#select-all', trajLayerGroup);
    selectAll('#all-outlier', outlierGroup);
//select each layer
    const checkBoxList = document.querySelectorAll(
        ".first-column > label > input[type=checkbox]"
    );
    selectEach(checkBoxList, trajLayerGroup, '#select-all');

    const checkBoxOutlierList = document.querySelectorAll(
        ".first-column-outlier > label > input[type=checkbox]"
    );
    selectEach(checkBoxOutlierList, outlierGroup, '#all-outlier')
//zoom to layer
    const select = document.querySelector("#show-head-tail");
    //trajline
    const mapView = map.getView();
    for (let item of getTrajList) {
        item.addEventListener('click', function () {
            zoomToLayer(mapView, headCoordinateList[item.id - 1]);
            showStartFinish(popupHead, popupHeadElement, popupTail, popupTailElement,
                headCoordinateList[item.id - 1], tailCoordinateList[item.id - 1]);
        })
    }

    //outlier
    for (let item of getList) {
        item.addEventListener('click', function () {
            zoomToLayer(mapView, headCoordinateList[item.id - 1]);
        })
    }
    $('#reset-btn').click(function () {
        mapView.animate({center: [11875016.021677138, 1205364.5582473525]}, {zoom: 10});
    });

    $('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
    });

    $('.open-btn').click(function () {
        openNav();
    });
    $('.cls-btn').click(function () {
        closeNav();
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            closeNav();
        }
    });

    const checkHead = $("#popup-head");
    const checkTail = $("#popup-tail");
    select.addEventListener('change', function () {
        if (select.checked) {
            console.log("checked");
            checkHead.css('visibility', 'visible');
            checkTail.css('visibility', 'visible');
        } else {
            console.log(("unchecked"));
            checkHead.css('visibility', 'hidden');
            checkTail.css('visibility', 'hidden');
        }
    });
}

function showStartFinish(popupHead, popupHeadElement, popupTail, popupTailElement, head, tail) {
    const coordinateHead = ol.proj.fromLonLat([head.lon, head.lat]);
    const coordinateTail = ol.proj.fromLonLat([tail.lon, tail.lat]);
    popupHead.setPosition(coordinateHead);
    popupHeadElement.innerHTML = "Start";
    popupTail.setPosition(coordinateTail);
    popupTailElement.innerHTML = "Finish";
}

function openNav() {
    document.getElementById("side-menu").style.width = "40%";
    $('.open-btn').css('visibility', 'hidden');
}

function closeNav() {
    document.getElementById("side-menu").style.width = "0";
    setTimeout(function () {
        $('.open-btn').css('visibility', 'visible');
    }, 500);

}

function selectAll(element, trajGroup) {
    const selectAllCheckbox = document.querySelectorAll(element)[0];
    selectAllCheckbox.addEventListener('change', function () {
        trajGroup.getLayers().forEach(function (item) {
            if (selectAllCheckbox.checked) {
                item.setVisible(true);
            } else {
                item.setVisible(false);
            }
        })
    })
}

function selectEach(checkboxGroup, group, select) {
    for (let item of checkboxGroup) {
        item.addEventListener('change', function () {
            let layerValue = item.value;
            let layer;
            let checkAll = true;
            group.getLayers().forEach(function (element) {
                if (layerValue === element.get('title')) {
                    layer = element;
                    console.log(layer.get('title'))
                }
            })
            this.checked ? layer.setVisible(true) : layer.setVisible(false);
            if (!this.checked)
                $(select).prop("checked", false);
            for (let item of checkboxGroup) {
                if (!item.checked) {
                    checkAll = false;
                    break;
                }
            }
            if (checkAll)
                $(select).prop("checked", true);
        })
    }
}

function zoomToLayer(view, coor) {
    view.animate({center: ol.proj.fromLonLat([coor.lon, coor.lat])}, {zoom: 17});
}

function sortTable(n) {
    document.getElementsByTagName("body")[0].style.cursor = "wait";
    // document.getElementById("overlay").setAttribute("style", "display: flex");
    let table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
    table = document.getElementById("my-table");
    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;

        /*Loop through all table rows (except the
        first, which contains table headers):*/
        for (i = 1; i < rows.length - 1; i++) {
            //start by saying there should be no switching:
            shouldSwitch = false;
            /*Get the two elements you want to compare,
            one from current row and one from the next:*/
            x = rows[i].getElementsByTagName("td")[n];
            y = rows[i + 1].getElementsByTagName("td")[n];
            /*check if the two rows should switch place,
            based on the direction, asc or desc:*/
            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /*If a switch has been marked, make the switch
            and mark that a switch has been done:*/
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            //Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /*If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again.*/
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    if (dir === "desc") {
        const temp = document.getElementsByClassName("table-header")[n - 1].innerHTML;
        const str = temp.split(" ");
        document.getElementsByClassName("table-header")[n - 1].innerHTML = str[0] + "  ▼";
    } else {
        const temp = document.getElementsByClassName("table-header")[n - 1].innerHTML;
        const str = temp.split(" ");
        document.getElementsByClassName("table-header")[n - 1].innerHTML = str[0] + "  ▲";
    }
    document.getElementsByTagName("body")[0].style.cursor = "default";
    // document.getElementById("overlay").setAttribute("style", "display: none");
}

// let header1 = document.getElementById('header1');
// header1.addEventListener('click', () => {
//     console.log("abc")
// })



