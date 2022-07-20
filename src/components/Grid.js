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
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import PSPDFKit from "pspdfkit";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Gridd from "@mui/material/Grid";
//import "../index.css";
import "../styles/style.css";
import Cellrenderer from "./CellRenderer";

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
  var fileDownload = require("react-file-download");
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const [Instance, setInstance] = React.useState(null);
  const [rowData, setRowData] = useState();
  const columnDefs = useMemo(
    () => [     
      {
        field: "value",
        headerName: "Tag",
        editable: true,
        width: 320,
        cellEditorFramework: Cellrenderer,
        cellRenderer: Cellrenderer,
        valueSetter: (params) => {
          console.log(params);
          const va = (params.newValue && params.newValue) || null;
          params.data.tag = (va && va.name) || "";
          params.data.tagId = (va && va.id) || 0;
          return true;
        },
      },
      {
        field: "facts.10.v",
        width: 180,
        headerName: "FY21",
        editable: true,
      },
      {
        field: "facts.20.v",
        width: 180,
        headerName: "FY20",
        editable: true,
      },
    ],
    []
  );
  const autoGroupColumnDef = useMemo(() => {
    return {
      field: 'name',
      headerName: 'name',
      minWidth: 300,
      cellRendererParams: {
        suppressCount: true,
      },
    };
  }, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      enableRowGroup: true,
    }),
    []
  );
  
  useEffect(() => {
    //pdf
    const container = containerRef.current;
    PSPDFKit.unload(container);
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
    let gridApi = params.api;
    let gridColumnApi = params.columnApi;
    fetch("BalanceSheet.json")
      .then((resp) => resp.json())
      .then((rowData) => setRowData(rowData["data"]["lineItmes"]));
  }, []);

  const onBtExport = () => {
    const existCols = [];
    const cols = gridRef.current.api.getColumnDefs();
    console.log(cols);
    const tempAsReportedData = [];
    gridRef.current.api.forEachNode(function (node) {
      console.log(node);
      tempAsReportedData.push(node.data);
    });
    fileDownload(
      JSON.stringify({
        requestToken: "",
        data: rowData,
      }),
      "download.json"
    );
  };
  return (
    <>
      <div>
        <button
          onClick={onBtExport}
          style={{ marginBottom: "5px", fontWeight: "bold" }}
        >
          Export to JSON
        </button>
      </div>
      <Box style={{ maxHeight: "100vh", overflow: "auto" }}>
        <Gridd container spacing={2}>
          <Gridd item xs={7}>
            <Item>
              {" "}
              <div style={{ height: "750px" }}>
                <AgGridReact
                  ref={gridRef}
                  className="ag-theme-balham"
                  animateRows="true"
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  treeData = {true}
                  getDataPath={(rowData)=>{
                    return rowData.filePath;
                  }}
                  getrownodeId={(rowData)=> {
                    console.log(rowData.id);
                    return rowData.id;
                  }}
                 autoGroupColumnDef={autoGroupColumnDef}
                  showOpenedGroup={true}
                  enableRangeSelection="true"
                  suppressMenuHide={true}
                  rowData={rowData}
                  // groupDisplayType="rowGroups"
                  rowSelection="multiple"
                  onCellClicked={onCellClicked}
                  onGridReady={onGridReady}
                />
              </div>
            </Item>
          </Gridd>
          <Gridd item xs={5}>
            <Item>
              <div
                ref={containerRef}
                style={{ width: "100%", height: "750px" }}
              />
            </Item>
          </Gridd>
        </Gridd>
      </Box>
    </>
  );
}