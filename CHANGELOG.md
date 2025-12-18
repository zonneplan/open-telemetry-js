# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [1.3.3](https://github.com/zonneplan/open-telemetry-js/compare/v1.3.2...v1.3.3) (2025-12-18)

## [1.3.2](https://github.com/zonneplan/open-telemetry-js/compare/v1.3.1...v1.3.2) (2025-12-18)

## [1.3.1](https://github.com/zonneplan/open-telemetry-js/compare/v1.3.0...v1.3.1) (2025-12-18)


### Reverts

* Revert "feat(open-telemetry-zonneplan): enable io-redis tracing" ([51382cf](https://github.com/zonneplan/open-telemetry-js/commit/51382cfdb58740cb07206a51f99ad69d4f786e88))

## [1.3.0](https://github.com/zonneplan/open-telemetry-js/compare/v1.2.0...v1.3.0) (2025-04-02)


### Features

* **open-telemetry-zonneplan:** enable io-redis tracing ([66ee994](https://github.com/zonneplan/open-telemetry-js/commit/66ee994d1e2d44cac1621ad6b1f0f5319d2b4ca3))

## [1.2.0](https://github.com/zonneplan/open-telemetry-js/compare/v1.1.1...v1.2.0) (2025-01-07)


### Features

* **open-telemetry-node:** Add ObservableGauge ([d4c5bb7](https://github.com/zonneplan/open-telemetry-js/commit/d4c5bb768a48ae5920338aefeea6d6b5c62bb736))

## [1.1.1](https://github.com/zonneplan/open-telemetry-js/compare/v1.1.0...v1.1.1) (2025-01-02)


### Bug Fixes

* Use exported types only ([#49](https://github.com/zonneplan/open-telemetry-js/issues/49)) ([3cfcc83](https://github.com/zonneplan/open-telemetry-js/commit/3cfcc83c99fd19303b1cf05c54527557229b4728))

## [1.1.0](https://github.com/zonneplan/open-telemetry-js/compare/v1.0.2...v1.1.0) (2024-10-08)


### Features

* use diag error logging for uninitialized providers ([577e1d4](https://github.com/zonneplan/open-telemetry-js/commit/577e1d47578616c62d0514709144b3d704f3bd63))

## [1.0.2](https://github.com/zonneplan/open-telemetry-js/compare/v1.0.1...v1.0.2) (2024-10-03)

## [1.0.1](https://github.com/zonneplan/open-telemetry-js/compare/v1.0.0...v1.0.1) (2024-10-03)

## [1.0.0](https://github.com/zonneplan/open-telemetry-js/compare/v0.1.0...v1.0.0) (2024-07-05)


### Features

* **open-telemetry-nest:** add log_level_otel support ([#15](https://github.com/zonneplan/open-telemetry-js/issues/15)) ([dbc8864](https://github.com/zonneplan/open-telemetry-js/commit/dbc8864c627b69225cc19cbdbbd9e2bccc74099a))
* **open-telemetry-nest:** added log context for nest ([#8](https://github.com/zonneplan/open-telemetry-js/issues/8)) ([f55b1ce](https://github.com/zonneplan/open-telemetry-js/commit/f55b1ce31f7963682f16014f9ab2f1de32ed1fa9))
* **open-telemetry-nest:** support node v0.2.1 ([00ef0d6](https://github.com/zonneplan/open-telemetry-js/commit/00ef0d62e81b26ec458e8814ed43b29ce0b71c12))
* **open-telemetry-node:** enable diag logging ([#18](https://github.com/zonneplan/open-telemetry-js/issues/18)) ([77b44f3](https://github.com/zonneplan/open-telemetry-js/commit/77b44f331533bc676f7a46af40ba6735dea1f301))
* **open-telemetry-node:** use sync gauge instead of observable gauge ([#22](https://github.com/zonneplan/open-telemetry-js/issues/22)) ([e30ccef](https://github.com/zonneplan/open-telemetry-js/commit/e30ccef9e665191fec683c05861b7e6c66a8a54d))
* **open-telemetry-zonneplan:** bump otel nest to ^0.2.1 ([288dc55](https://github.com/zonneplan/open-telemetry-js/commit/288dc55b65cffe24ae3dbc0c83e48ce45811bb98))
* **open-telemetry-zonneplan:** optionally global LoggerModule ([#17](https://github.com/zonneplan/open-telemetry-js/issues/17)) ([e1a31e4](https://github.com/zonneplan/open-telemetry-js/commit/e1a31e45683a896e4ca72c53800235d13d2d1992))
* **open-telemetry-zonneplan:** support node (0.2.1) and nest (0.3.0) ([0bd5eed](https://github.com/zonneplan/open-telemetry-js/commit/0bd5eedb1c4685d9072916f4d09dd35ce2b6c8cd))


### Bug Fixes

* **open-telemetry-nest:** add context to log emission ([8186a06](https://github.com/zonneplan/open-telemetry-js/commit/8186a06329656b332015cf026196e07e02dc4b38))
* **open-telemetry-nest:** make logger optional params optional ([0ca0d4a](https://github.com/zonneplan/open-telemetry-js/commit/0ca0d4a61105051daa78770d950d8302bad6b2cd))
* **open-telemetry-node:** removed duplicate trace provider ([#19](https://github.com/zonneplan/open-telemetry-js/issues/19)) ([b164464](https://github.com/zonneplan/open-telemetry-js/commit/b164464ac8b1f90e7effcfaced3ed1b3a71c2f6d))
* **open-telemetry-zonneplan:** allow any nest minor ([fa56b6f](https://github.com/zonneplan/open-telemetry-js/commit/fa56b6f0bcbc13240a39e2efc92b5a52b1236463))
* skip nx dependency checks ver mismatch ([629781a](https://github.com/zonneplan/open-telemetry-js/commit/629781a058fa86b891e66f2b3aecea2e41dc91a8))
* wrong dep ([236d4d4](https://github.com/zonneplan/open-telemetry-js/commit/236d4d4351a86506d4d1beaa91e8e1f6ce622f5f))
* wrong package-lock.json ([#11](https://github.com/zonneplan/open-telemetry-js/issues/11)) ([f1786dc](https://github.com/zonneplan/open-telemetry-js/commit/f1786dcc2e277466425ba237a1362661f15788c1))


### Reverts

* Revert "chore: dont run githooks after version bump" ([dc890b0](https://github.com/zonneplan/open-telemetry-js/commit/dc890b023fa6f2687fbf8040284d1428abe17b4f))
* Revert "chore(open-telemetry-nest): release version 0.1.2" ([8c2b979](https://github.com/zonneplan/open-telemetry-js/commit/8c2b979b9f8f5fc365b23fe1d7f2eeda5a850f77))
* "chore: sync versions on release" ([e5674a9](https://github.com/zonneplan/open-telemetry-js/commit/e5674a9a8fa11770adbd24c91d52b2965c677091))
