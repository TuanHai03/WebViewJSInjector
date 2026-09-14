(() => {
  "use strict";
  const MOD = window.MOD;
  MOD.tabId = "mod-tab";
  MOD.styleId = "mod-style";
  MOD.Style = (() => {
    function getCSS() {
      return `
            #${MOD.tabId} {
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                overflow: auto;
                position: relative;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${MOD.tabId} .mod-page {
                width: 100%;
                min-height: 100%;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                background: var(--mod-bg, #f5f5f5);
                color: var(--mod-text, #222);
            }

            #${MOD.tabId} .mod-header {
                height: 55px;
                min-height: 55px;
                display: flex;
                align-items: center;
                box-sizing: border-box;
                background: #333;
                color: #fff;
            }

            #${MOD.tabId} .mod-back {
                width: 55px;
                height: 55px;
                min-width: 55px;
                border: 0;
                background: transparent;
                color: #fff;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            #${MOD.tabId} .mod-back:active {
                background: rgba(255,255,255,.15);
            }

            #${MOD.tabId} .mod-title {
                flex: 1;
                font-size: 18px;
                font-weight: bold;
                color: #fff !important;
            }

            #${MOD.tabId} .mod-content {
                flex: 1;
                overflow: auto;
                box-sizing: border-box;
                padding: 15px;
                background: var(--mod-bg, #f5f5f5);
            }

            #${MOD.tabId} .mod-card {
                background: var(--mod-card-bg, #fff);
                color: var(--mod-text, #222);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 12px;
                box-sizing: border-box;
                box-shadow: 0 2px 5px rgba(0,0,0,.12);
            }

            #${MOD.tabId} .mod-card-title {
                display: block;
                width: 100%;
                color: var(--mod-title, #222) !important;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 10px;
            }

            #${MOD.tabId} .mod-card-title i {
                color: inherit !important;
                margin-right: 6px;
            }

            #${MOD.tabId} .mod-button {
                display: block;
                width: 100%;
                box-sizing: border-box;
                padding: 12px;
                margin-top: 7px;
                border: 0;
                border-radius: 6px;
                background: var(--mod-button-bg, #eee);
                color: var(--mod-button-text, #222) !important;
                text-align: left;
                font-size: 14px;
                cursor: pointer;
            }

            #${MOD.tabId} .mod-button i {
                color: inherit !important;
                margin-right: 6px;
            }
            #${MOD.tabId} .mod-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            #${MOD.tabId} .mod-toggle-icon {
                width: 20px;
                height: 20px;
                min-width: 20px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 0 !important;
                font-size: 18px;
                flex-shrink: 0;
            }

            #${MOD.tabId} .mod-toggle-label {
                display: inline-block;
                line-height: 20px;
            }
                        #${MOD.tabId} .mod-button:active {
                            transform: none;
                        }

                        /* CHECKBOX */

                        #${MOD.tabId} .mod-checkbox {
                            display: flex;
                            align-items: center;
                            width: 100%;
                            box-sizing: border-box;
                            padding: 12px;
                            margin-top: 7px;
                            border-radius: 6px;
                            background: var(--mod-button-bg, #eee);
                            color: var(--mod-button-text, #222);
                            cursor: pointer;
                            user-select: none;
                        }

                        #${MOD.tabId} .mod-checkbox input {
                            display: none;
                        }

                        #${MOD.tabId} .mod-checkmark {
                            width: 20px;
                            height: 20px;
                            min-width: 20px;
                            border: 2px solid #888;
                            border-radius: 4px;
                            margin-right: 10px;
                            box-sizing: border-box;
                            position: relative;
                        }

                        #${MOD.tabId} .mod-checkbox input:checked + .mod-checkmark {
                            background: #2196f3;
                            border-color: #2196f3;
                        }

                        #${MOD.tabId} .mod-checkbox input:checked + .mod-checkmark::after {
                            content: "";
                            position: absolute;
                            left: 5px;
                            top: 1px;
                            width: 6px;
                            height: 11px;
                            border: solid white;
                            border-width: 0 2px 2px 0;
                            transform: rotate(45deg);
                        }

                        #${MOD.tabId} .mod-checkbox-text {
                            font-size: 14px;
                        }

                        #${MOD.tabId} .mod-checkbox-text i {
                            margin-right: 6px;
                        }


                        /* SELECT / COMBOBOX */

                        #${MOD.tabId} .mod-select {
                            width: 100%;
                            box-sizing: border-box;
                            margin-top: 7px;
                        }

                        #${MOD.tabId} .mod-select-label {
                            font-size: 14px;
                            margin-bottom: 5px;
                        }

                        #${MOD.tabId} .mod-select-label i {
                            margin-right: 6px;
                        }

                        #${MOD.tabId} .mod-select select {
                            width: 100%;
                            box-sizing: border-box;
                            padding: 10px 12px;
                            border: 0;
                            border-radius: 6px;
                            background: var(--mod-button-bg, #eee);
                            color: var(--mod-button-text, #222);
                            font-size: 14px;
                            outline: none;
                            cursor: pointer;
                        }


                    #${MOD.tabId} #mod-status {
                                max-height: 360px;
                                overflow-y: auto;
                                padding: 8px;
                                margin-top: 8px;
                                border-radius: 6px;
                                background: #111;
                                color: #0f0;
                                font-family: monospace;
                                font-size: 12px;
                                line-height: 1.5;
                                white-space: pre-wrap;
                                word-break: break-word;
                    }

                        /* DARK MODE */
                            @media (prefers-color-scheme: dark) {
                            #${MOD.tabId} {
                                --mod-bg: #121212;
                                --mod-card-bg: #1e1e1e;
                                --mod-text: #eeeeee;
                                --mod-title: #ffffff;
                                --mod-button-bg: #2a2a2a;
                                --mod-button-text: #eeeeee;
                                --mod-status: #aaaaaa;
                            }

                            #${MOD.tabId} .mod-card {
                                box-shadow: 0 2px 6px rgba(0,0,0,.4);
                            }
                        }

                        /* Nếu Web dùng class dark */
                        body.dark #${MOD.tabId},
                        body.dark-mode #${MOD.tabId},
                        html.dark #${MOD.tabId},
                        html.dark-mode #${MOD.tabId} {
                            --mod-bg: #121212;
                            --mod-card-bg: #1e1e1e;
                            --mod-text: #eeeeee;
                            --mod-title: #ffffff;
                            --mod-button-bg: #2a2a2a;
                            --mod-button-text: #eeeeee;
                            --mod-status: #aaaaaa;
                        }
                            /* TOGGLE TRUE / FALSE */

                        #${MOD.tabId} .mod-toggle {
                                display: flex;
                                align-items: center;
                            }

            #${MOD.tabId} .mod-toggle .mod-toggle-icon {
                width: 22px;
                min-width: 22px;
                text-align: center;
                margin-right: 8px;
                font-size: 18px;
            }

            #${MOD.tabId} .mod-toggle .mod-button-label {
                margin: 0;
            }
                #${MOD.tabId} .mod-card-title.mod-collapse {
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: space-between !important;
                  width: 100% !important;
                  box-sizing: border-box;
                  cursor: pointer;
              }

              #${MOD.tabId} .mod-card-title.mod-collapse > span {
                  display: flex;
                  align-items: center;
                  flex: 1;
              }

              #${MOD.tabId} .mod-card-title.mod-collapse > .mod-collapse-icon {
                  display: block !important;
                  margin-left: auto !important;
                  margin-right: 0 !important;
                  flex-shrink: 0;
                  font-size: 14px;
                }
                 button.mod-download-btn {
    width: 40px !important;
    height: calc(100% - 20px) !important;

    margin: 5px 0px 5px 5px !important;

    padding: 0 !important;

    display: inline-flex !important;
    align-items: center;
    justify-content: center;

    background: none;
    border: 0;
}
button.mod-download-btn .mod-epub-icon {
    width: auto !important;
    height: 100% !important;

    max-width: 40px !important;
    max-height: 100% !important;

    display: block !important;
    flex: 0 0 auto !important;
} `;
    }

    function apply() {
      // Xóa style cũ
      const oldStyle = document.getElementById(MOD.styleId);

      if (oldStyle) {
        oldStyle.remove();
      }

      // Tạo style mới
      const style = document.createElement("style");

      style.id = MOD.styleId;
      style.textContent = getCSS();

      document.head.appendChild(style);

      console.log("[MODStyle] Style applied");
    }

    function remove() {
      const style = document.getElementById(MOD.styleId);

      if (style) {
        style.remove();
      }

      console.log("[MODStyle] Style removed");
    }

    return {
      apply,
      remove,
      getCSS,
    };
  })();
  MOD.Style.apply();
})();
