sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/BusyIndicator",
    "sap/m/BusyDialog",
    "sap/ui/core/Fragment",
  ],
  function (
    Controller,
    JSONModel,
    ResourceModel,
    History,
    Filter,
    MessageBox,
    MessageToast,
    Dialog,
    Button,
    Text,
    BusyIndicator,
    BusyDialog,
    Fragment
  ) {
    "use strict";

    return Controller.extend("pod.controller.Main", {
      locale: navigator.language || navigator.userLanguage,
      model: new JSONModel(),
      globalInput: {},
      route: "ACADEMY22/RESOURCEMANAGE/TRANSACTION",
      name: false,
      desc: false,

      onInit: function () {
        //set model
        this.getView().setModel(this.model);
        this.globalInput.SITE = "ES01";

        const data = this.getDataSync("CREATE_RESRCE_TYPE", this.route, {
          SITE: "ES01",
        });

        this.model.setProperty("/resrce", data);
        //get url parameters
        /*var param = jQuery.sap.getUriParameters().get("dept");
			if (param && param !== "null") {
				this.model.setProperty("/dept", param.toUpperCase());
			} else {
				this.model.setProperty("/dept", "");
			}*/

        //get data
        //   this.getSiteAndUser();
      },

      onAfterRendering: function () {
        //set page title
        document.title = this.getView()
          .getModel("i18n")
          .getProperty("page.title");
        this.getSiteForComboBox();
      },

      getSiteForComboBox: function () {
        var result = this.getDataSync(
          "GETSITE",
          "ACADEMY22/RESOURCEMANAGE/TRANSACTION",
          {}
        );
        this.model.setProperty("/modelSite", result);
      },

      onOpenDialog: function () {
        var oView = this.getView();
        // create dialog lazily
        if (!this.pDialog) {
          this.pDialog = Fragment.load({
            id: oView.getId(),
            name: "pod.view.Dialog",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }
        this.pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      inputName: function (oEvent) {
        const val = oEvent.getParameters("value").value;
        const oButton = this.getView().byId("myBTN");
        this.globalInput.NAME = val;

        if (val.length > 3) this.name = true;
        else this.name = false;
        if (this.name == true && this.desc == true) oButton.setEnabled(true);
        else oButton.setEnabled(false);
      },

      inputDescription: function (oEvent) {
        const val = oEvent.getParameters("value").value;
        const oButton = this.getView().byId("myBTN");
        this.globalInput.DESCRIPTION = val;

        if (val.length > 5) this.desc = true;
        else this.desc = false;
        if (this.name == true && this.desc == true) oButton.setEnabled(true);
        else oButton.setEnabled(false);
      },

      onCloseDialog: function () {
        this.onExit();

        delete this.globalInput.NAME;
        delete this.globalInput.DESCRIPTION;
      },

      handleCreateType: function () {
        this.onExit();

        this.globalInput.INPUT = "create";
        const data = this.getDataSync(
          "CREATE_RESRCE_TYPE",
          this.route,
          this.globalInput
        );

        delete this.globalInput.NAME;
        delete this.globalInput.DESCRIPTION;
        delete this.globalInput.INPUT;

        this.model.setProperty("/resrce", data);
      },

      changeSite: function (oEvent) {
        const site = oEvent.getParameters().value;
        this.globalInput.SITE = site;
        const result = this.getDataSync(
          "CREATE_RESRCE_TYPE",
          "ACADEMY22/RESOURCEMANAGE/TRANSACTION",
          this.globalInput
        );
        this.model.setProperty("/resrce", result);
      },

      handleRoute: function (oEvent) {
        const obj = oEvent.getSource().getBindingContext().getObject();
        const param = `${obj.SITE}/${obj.RESOURCE_TYPE}/${obj.HANDLE}`;
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("resrcetype", {
          bindParam: window.encodeURIComponent(param),
        });
      },

      //UTILIES//
      onExit: function () {
        const oButton = this.getView().byId("myBTN");

        this.byId("helloDialog").close();
        this.getView().byId("nameInput").setValue("");
        this.getView().byId("descriptionInput").setValue("");
        oButton.setEnabled(false);
        this.name = false;
        this.desc = false;
      },

      //INITIAL FUNCTIONS//
      getSiteAndUser: function () {
        var that = this;
        var params = {
          Service: "Admin",
          Mode: "UserAttribList",
          Session: "false",
          "content-Type": "text/xml",
        };

        try {
          var req = jQuery.ajax({
            url: "/XMII/Illuminator",
            data: params,
            method: "GET",
            async: true,
          });
          req.done(jQuery.proxy(that.loginSuccess, that));
          req.fail(jQuery.proxy(that.loginError, that));
        } catch (err) {
          jQuery.sap.log.debug(err.stack);
        }
      },

      loginSuccess: function (data, response) {
        var site = jQuery(data).find("DEFAULT_SITE").text();
        var user = jQuery(data).find("User").text();
        var username = jQuery(data).find("FullName").text();

        this.site = site;
        this.user = user;
        this.model.setProperty("/username", username.toUpperCase());

        if (!this.site) {
          location.reload(true);
        }

        //get data
        /*getInfo();*/
      },

      loginError: function (error) {
        location.reload(true);
      },

      //DATA FUNCTIONS//
      //  transactionError: function (error) {
      //   sap.ui.core.BusyIndicator.hide();

      //   console.error(error);
      //  },

      //  getInfo: function () {
      // 		var input = {
      // 			SITE: this.site
      // 		};

      // 		this.getDataAsync("TRANSACTION_NAME", "SITE/PATH/TRANSACTION", input, this.getInfoSuccess, this.transactionError);
      // 	},

      // 	getInfoSuccess: function (data, response) {
      // 		sap.ui.core.BusyIndicator.hide();

      // 		var jsonArrStr = jQuery(data).find("Row").text();
      // 		var jsonArr = JSON.parse(jsonArrStr);

      // 		this.model.setProperty("/MODEL", obj);
      // 	},

      //  saveInfo: function () {
      // 		var input = {
      // 			SITE: this.site
      // 		};

      // 		this.getDataAsync("TRANSACTION_NAME", "SITE/PATH/TRANSACTION", input, this.saveInfoSuccess, this.transactionError);
      // 	},

      // 	saveInfoSuccess: function (data, response) {
      // 		sap.ui.core.BusyIndicator.hide();

      // 		var jsonArrStr = jQuery(data).find("JSON").text();
      // 		var jsonArr = JSON.parse(jsonArrStr);

      // 		if (jsonArr[0].RESULT === "0") {
      // 			MessageToast.show("Save successful");
      // 		} else {
      // 			MessageBox.error(jsonArr[0].MESSAGE);
      // 		}
      // 	},

      //OTHER FUNCTIONS//

      ////UTILITIES////

      formatDate: function (arg) {
        var date = new Date(arg + "Z");
        if (!date instanceof Date || isNaN(date)) {
          return "";
        }

        var options = {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        };
        var formattedDate = date.toLocaleString(this.locale, options);

        return formattedDate;
      },

      //GENERIC CALLS//
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
          url: "https://srvmes.icms.it/XMII/Runner",
          success: function (data) {
            try {
              results = eval(data.documentElement.textContent);
            } catch (err) {
              try {
                results = JSON.parse(data.documentElement.textContent);
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

      getDataAsync: function (
        transaction,
        route,
        input,
        successFunc,
        errorFunc
      ) {
        sap.ui.core.BusyIndicator.show();

        var transactionCall = route + "/" + transaction;
        var that = this;

        input.TRANSACTION = transactionCall;
        input.OutputParameter = "*";

        try {
          var req = jQuery.ajax({
            url: "/XMII/Runner",
            data: input,
            method: "POST",
            dataType: "xml",
            async: true,
          });
          req.done(jQuery.proxy(successFunc, that));
          req.fail(jQuery.proxy(errorFunc, that));
        } catch (err) {
          jQuery.sap.log.debug(err.stack);
        }
      },

      //TOOLBAR FUNCTIONS//
      onNavBack: function () {
        window.history.back();
      },

      onLogout: function () {
        var that = this;
        var dialog = new Dialog({
          title: that.getView().getModel("i18n").getProperty("dialog.logout"),
          type: "Message",
          state: "Warning",
          content: new Text({
            text: that
              .getView()
              .getModel("i18n")
              .getProperty("dialog.logoutConfirm"),
          }),
          beginButton: new Button({
            icon: "sap-icon://undo",
            type: "Reject",
            press: function () {
              dialog.close();
            },
          }).addStyleClass("halfSizeButton"),
          endButton: new Button({
            icon: "sap-icon://accept",
            type: "Accept",
            press: function () {
              dialog.close();
              var params = {
                Service: "Logout",
                Session: "false",
                "content-Type": "text/xml",
              };
              $.ajax({
                type: "POST",
                data: params,
                async: false,
                url: "/XMII/Illuminator",
                success: function (data) {
                  try {
                    var urll = window.location.href;
                    history.pushState({}, null, urll);
                    location.reload(true);
                  } catch (err) {}
                },
                error: function searchError(xhr, err) {
                  console.error("Error on ajax call: " + err);
                  console.log(JSON.stringify(xhr));
                },
              });
            },
          }).addStyleClass("halfSizeButton"),
          afterClose: function () {
            dialog.destroy();
          },
        });

        dialog.open();
      },
    });
  }
);
