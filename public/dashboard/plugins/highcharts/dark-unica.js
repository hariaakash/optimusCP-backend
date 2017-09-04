Highcharts.theme = {
	"colors": ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
	"chart": {
		"backgroundColor": "#353c48",
		"style": {
			"color": "#FFFFFF"
		}
	},
	"title": {
		"align": "center",
		"style": {
			"color": "#FFFFFF"
		}
	},
	"subtitle": {
		"align": "center",
		"style": {
			"color": "#FFFFFF"
		}
	},
	"legend": {
		"align": "right",
		"verticalAlign": "bottom"
	},
  "xAxis": {
    "gridLineColor": "#2E3740",
    "gridLineWidth": 1,
    "labels": {
      "style": {
        "color": "#FFFFFF"
      }
    },
    "lineColor": "#2E3740",
    "tickColor": "#2E3740",
    "title": {
      "style": {
        "color": "#FFFFFF"
      }
    }
  },
  "yAxis": {
    "gridLineColor": "#2E3740",
    "gridLineWidth": 1,
    "labels": {
      "style": {
        "color": "#FFFFFF"
      },
      "lineColor": "#2E3740",
      "tickColor": "#2E3740",
      "title": {
        "style": {
          "color": "#FFFFFF"
        }
      }
    },
	  "title": {
		  "style": {
			  "color": "#FFFFFF"
		  }
	  }
  },
	"plotOptions": {
		"line": {
			"marker": {
				"enabled": false
			}
		},
		"spline": {
			"marker": {
				"enabled": false
			}
		},
		"area": {
			"marker": {
				"enabled": false
			}
		},
		"areaspline": {
			"marker": {
				"enabled": false
			}
		},
		"bubble": {
			"maxSize": "10%"
		}
	}
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);
