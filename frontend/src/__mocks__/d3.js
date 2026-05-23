'use strict';

/**
 * Jest 전용 d3 스텁 — `package.json`의 `jest.moduleNameMapper`가 `^d3$`를 이 파일로 고정함.
 * 플루언트 체인 + 최소 forceSimulation 스텁(실제 d3 ESM은 Jest 기본 변환에서 로드되지 않음).
 */
function fluent() {
  const bag = Object.create(null);
  const proxy = new Proxy(bag, {
    get(target, prop) {
      if (prop === 'then') return undefined;
      const k = String(prop);
      if (k === 'attr') {
        if (!target._attr) {
          target._attr = jest.fn(function attr(_name, val) {
            if (typeof val === 'function') {
              try {
                val(
                  { dominant_stance: '중립', label: '', id: '' },
                  0,
                  []
                );
              } catch {
                /* ConversationGraphView 등 콜백이 datum을 가정함 */
              }
            }
            return proxy;
          });
        }
        return target._attr;
      }
      if (k === 'text') {
        if (!target._text) {
          target._text = jest.fn(function text(val) {
            if (typeof val === 'function') {
              try {
                val({ label: '', id: '' }, 0, []);
              } catch {
                /* noop */
              }
            }
            return proxy;
          });
        }
        return target._text;
      }
      if (k === 'call') {
        if (!target._call) {
          target._call = jest.fn(function call(fn) {
            if (typeof fn === 'function') {
              try {
                fn(proxy);
              } catch {
                /* drag 등이 selection·DOM을 가정함 */
              }
            }
            return proxy;
          });
        }
        return target._call;
      }
      if (k === 'on' || k === 'join' || k === 'clone' || k === 'lower' || k === 'id' || k === 'distance' || k === 'strength' || k === 'radius') {
        if (!target[k]) {
          target[k] = jest.fn(() => proxy);
        }
        return target[k];
      }
      if (!target[k]) {
        target[k] = jest.fn(() => proxy);
      }
      return target[k];
    },
    set() {
      return true;
    },
  });
  return proxy;
}

function mkSimulation() {
  return {
    force: jest.fn(function force() {
      return this;
    }),
    on: jest.fn(function on() {
      return this;
    }),
    stop: jest.fn(),
    alphaTarget: jest.fn(function alphaTarget() {
      return this;
    }),
    restart: jest.fn(),
  };
}

const select = jest.fn(() => fluent());

const api = {
  forceSimulation: jest.fn(() => mkSimulation()),
  forceLink: jest.fn(() => fluent()),
  forceManyBody: jest.fn(() => fluent()),
  forceCenter: jest.fn(() => fluent()),
  forceCollide: jest.fn(() => fluent()),
  select,
  drag: jest.fn(() => fluent()),
  zoom: jest.fn(() => fluent()),
  zoomIdentity: {},
};

module.exports = api;

