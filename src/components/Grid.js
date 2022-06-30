import React, {
  useMemo,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import PSPDFKit from "pspdfkit";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Gridd from "@mui/material/Grid";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RangeSelectionModule,
  RowGroupingModule,
  RichSelectModule,
]);
var Val;
export default function Grid() {
  const containerRef = useRef(null);
  const [Instance, setInstance] = React.useState(null);
  const columnDefs = useMemo(
    () => [
      { field: "name", width: 300 },
      { field: "tag", width: 90 },
      {
        field: "facts.10.v",
        width: 180,
        headerName: "Value-10",
        editable: true,
      },
      {
        field: "facts.20.v",
        width: 180,
        headerName: "Value-20",
        editable: true,
      },
      {
        field: "facts.30.v",
        width: 180,
        headerName: "Value-30",
        editable: true,
      },
    ],
    []
  );
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
    }),
    []
  );

  // const getSelectedRowData = (params) => {
  //   let gridApi = params.api;
  //   let selectedNodes = gridApi.getSelectedNodes();
  //   let selectedData = selectedNodes.map(node => node.data);
  //   alert(`Selected Nodes:\n${JSON.stringify(selectedData)}`);
  //   return selectedData;
  // };


  // const printNode = (node, index) => {
  //   console.log("TEST");
  //     console.log(
  //       index + ' -> data: ' + node.data.name + ', ' + node.data.facts[10].v
  //     );
  // };


  // const onBtForEachNode = useCallback(() => {
  //   console.log('### api.forEachNode() ###');
  //   containerRef.current.api.forEachNode(console.log("TEST"));
  // }, []);


  const [rowData, setRowData] = useState();
  // useEffect(() => {
  //   fetch("download (19).json")
  //     .then((resp) => resp.json())
  //     .then((rowData) => setRowData(rowData["data"]["lineItmes"]));
  // }, []);
  useEffect(() => { 
    //pdf
    const container = containerRef.current;
    PSPDFKit.load({
      container,
      document: `http://webapp.factstream.ai/web/15190/2021/15190_2021FY_AR_IR_PDF.pdf`,
      baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
    }).then((intance_va) => {
      setInstance(intance_va);
    });
  }, [Instance == null]);
  const onCellClicked = (params) => {
    Val = params.column.colId;
    const myArray = Val.split(".");
    var myId = myArray[1];
    const coordinates = params.data.facts[myId].a.BB;
    const left = coordinates["0"]; //x0
    const top = coordinates["1"]; //y0
    const right = coordinates["2"]; //x1
    const bottom = coordinates["3"]; //y1
    const height = bottom - top; //y1-y0
    const width = right - left; //x1-x0
    const pageNumber = params.data.facts[myId].a.pagenumber;
    const re_co = new PSPDFKit.Geometry.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
    });
    var rects = PSPDFKit.Immutable.List([new PSPDFKit.Geometry.Rect(re_co)]);
    if (pageNumber > 0) {
      var annotation = new PSPDFKit.Annotations.HighlightAnnotation({
        pageIndex: pageNumber - 1,
        rects: rects,
        boundingBox: PSPDFKit.Geometry.Rect.union(rects),
        isDeletable: true,
        isEditable: true,
      });
    }
    if (Instance) {
      Instance.jumpToRect(pageNumber - 1, re_co);
      const [createdAnnotation] = Instance.create(annotation);
    }
  };


  const onGridReady = useCallback((params) => {
      fetch("download (19).json")
      .then((resp) => resp.json())
      .then((rowData) => setRowData(rowData["data"]["lineItmes"]));

  }, []);

  const onBtExport = useCallback(() => {
    containerRef.current.api.exportDataAsExcel();
  }, []);

  return (
    <>
      <div>
          {/* <button 
          onClick={getSelectedRowData}
          style={{margin: 10}}
          >Get Selected Nodes</button> */}
          <button
            onClick={onBtExport}
            style={{ marginBottom: '5px', fontWeight: 'bold' }}
          >
            Export to Excel
          </button>
      </div>
      {/* <button onClick={onBtForEachNode}>For-Each Node</button> */}
      <Box sx={{ flexGrow: 1 }}>
        <Gridd container spacing={2}>
          <Gridd item xs={6}>
            <Item>
              {" "}
              <div style={{ height: "850px" }}>
                <AgGridReact
                  ref={containerRef}
                  className="ag-theme-alpine"
                  animateRows="true"
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  enableRangeSelection="true"
                  rowData={rowData}
                  rowSelection="multiple"
                  suppressRowClickSelection="true"
                  onCellClicked={onCellClicked}
                  onGridReady={onGridReady}
                />
              </div>
            </Item>
          </Gridd>
          <Gridd item xs={6}>
            <Item>
              <div
                ref={containerRef}
                style={{ width: "100%", height: "850px" }}
              />
            </Item>
          </Gridd>
        </Gridd>
      </Box>
    </>
  );
}