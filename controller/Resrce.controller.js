sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    ResourceModel,
    History,
    MessageBox,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("pod.controller.Resrce", {
      model: new JSONModel(),
      route: "ACADEMY22/RESOURCEMANAGE/TRANSACTION",
      selectedResrce: {},
      RES: {
        available: [],
        assign: [],
        param: {},
      },

      onInit: function () {
        this.getView().setModel(this.model);
        const oRouter = this.getOwnerComponent().getRouter();
        
        

        oRouter
          .getRoute("resrcetype")
          .attachPatternMatched(this.catchParam, this);
      },

      catchParam: function (oEvent) {
        const [site, resrceType, handle] = window
          .decodeURIComponent(oEvent.getParameter("arguments").bindParam)
          .split("/");

        this.RES.param.SITE = site;
        this.RES.param.RESRCE_TYPE = resrceType;
        this.RES.param.HANDLE = handle;

        this.render();

        this.getView().byId("resrce-type").setText(this.RES.param.RESRCE_TYPE);
      },

      handleAvailable: function (oEvent) {
        //PRENDI TUTTI I DATI GIA ESISTENTI E AGGIUNGI I NUOVI CAMPI
        this.selectedResrce = {};
        this.selectedResrce = {
          RESRCE_REF: oEvent.getSource().getBindingContext().getObject().HANDLE,
          RESRCE: oEvent.getSource().getBindingContext().getObject().RESRCE,
          TYPE_REF: this.RES.param.HANDLE,
        };
      },

      addResrce: function () {
        this.processFn("", "Seleziona una risorsa da aggiungere");
      },

      removeResrce: function () {
        this.processFn("delete", "Seleziona una risorsa da rimuovere");
      },

      //UTILIES//
      processFn: function (input, erroMSG) {
        //CONTROLLA SE UTENTE HA SELEZIONATO UNA RISORSA
        if (
          this.selectedResrce.RESRCE_REF &&
          this.selectedResrce.TYPE_REF &&
          this.selectedResrce.RESRCE
        ) {
          this.selectedResrce.INPUT = input;
          const [asignation] = this.getDataSync(
            "ASSIGN_RESRCE_TYPE",
            this.route,
            this.selectedResrce
          );
          if (asignation.RC == "0") {
            MessageToast.show(asignation.MESSAGE);

            //AGGIORNA TABELLA
            this.render();

            delete this.selectedResrce.RESRCE_REF;
            delete this.selectedResrce.TYPE_REF;
            delete this.selectedResrce.RESRCE;
          } else {
            MessageBox.error(asignation.MESSAGE);
          }
        } else {
          MessageToast.show(erroMSG);
        }
      },

      render: function () {
        const available = this.getDataSync(
          "UPDATE_AVAILABLE_TABLE",
          this.route,
          {
            RESRCE_TYPE: this.RES.param.RESRCE_TYPE,
            SITE: this.RES.param.SITE,
          }
        );

        const assign = this.getDataSync("UPDATE_ASSIGN_TABLE", this.route, {
          RESRCE_TYPE: this.RES.param.RESRCE_TYPE,
        });

        this.RES.available = available;
        this.RES.assign = assign;

        this.model.setProperty("/available", this.RES.available);
        this.model.setProperty("/assign", this.RES.assign);
      },

      onNavBack: function () {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("main", {}, true);
        }
      },

      getDataSync: function (transaction, route, input) {
        var results;
        var transactionCall = route + "/" + transaction;

        input.TRANSACTION = transactionCall;
        input.OutputParameter = "*";

        $.ajax({
          type: "POST",
          data: input,
          dataType: "xml",
          async: false,
          url: "/XMII/Runner",
          success: function (data) {
            try {
              results = eval(data.documentElement.textContent);
            } catch (err) {
              try {
                results = JSON.parse(data.documentElement.textContent);
                console.log(results);
                console.log(data.documentElement.textContent);
              } catch (err2) {
                results = [];
                MessageBox.error(data.documentElement.textContent);
              }
            }
          },
          error: function searchError(xhr, err) {
            console.error("Error on ajax call: " + err);
            console.log(JSON.stringify(xhr));
          },
        });
        return results;
      },
    });
  }
);
