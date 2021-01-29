import angular from "angular";

const module = angular.module("single-spa-angularjs", []);
module.directive("singleSpaParcel", () => ({
  restrict: "E",
  template: "<div></div>",
  scope: {
    mountParcel: "=",
    parcelConfig: "=",
    props: "=",
  },
  controller: [
    "$scope",
    "$element",
    "singleSpaProps",
    ($scope, $element, singleSpaProps) => {
      if (!$scope.parcelConfig) {
        throw Error(
          `single-spa-angularjs: The <single-spa-parcel> directive requires a parcelConfig object or function`
        );
      }

      const mountParcel = $scope.mountParcel || singleSpaProps.mountParcel;

      if (!mountParcel) {
        throw Error(
          "single-spa-angularjs: The <single-spa-parcel> directive requires a mountParcel function"
        );
      }

      const parcel = mountParcel($scope.parcelConfig, getParcelProps());

      $scope.$on("$destroy", parcel.unmount);

      $scope.$watch("props", () => {
        if (parcel.update) {
          parcel.update(getParcelProps());
        }
      });

      function getParcelProps() {
        const result = {
          domElement: $element[0],
        };

        if ($scope.props) {
          for (let k in $scope.props) {
            result[k] = $scope.props[k];
          }
        }

        return result;
      }
    },
  ],
}));
