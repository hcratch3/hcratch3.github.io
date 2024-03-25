import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import log from '../lib/log.js';

import parseOptionsFromUrl from './parse-url-options.js';

const onClickLogo = () => {
    window.location.href = 'https://hcratch3.github.io' + window.location.search + window.location.hash;
};

const handleTelemetryModalCancel = () => {
    log('User canceled telemetry modal');
};

const handleTelemetryModalOptIn = () => {
    log('User opted into telemetry');
};

const handleTelemetryModalOptOut = () => {
    log('User opted out of telemetry');
};

/*
 * Render the GUI playground. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * {object} appTarget - the DOM element to render to
 */
export default appTarget => {
    GUI.setAppElement(appTarget);

    // note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedGui = compose(
        AppStateHOC,
        HashParserHOC
    )(GUI);

    const {
        loadGriffpatch,
        loadPlugins,
        backpackHost,
        cloudHost,
        cloudSpecial,
        username,
        simulateScratchDesktop,
        compatibilityMode,
        fps,
        extensionURLs,
        imposeLimits,
        spriteFencing
    } = parseOptionsFromUrl();

    if (loadGriffpatch) {
        // From https://github.com/griffpatch/Scratch3-Dev-Tools/blob/master/inject.user.js
        // Ideally, I'd just load inject.user.js directly, but jsdelivr seems to omit it.
        document.head.appendChild(Object.assign(document.createElement('script'), {
            src: 'https://cdn.jsdelivr.net/gh/griffpatch/Scratch3-Dev-Tools/inject3.js'
        }));
        document.head.appendChild(Object.assign(document.createElement('link'), {
            href: 'https://cdn.jsdelivr.net/gh/griffpatch/Scratch3-Dev-Tools/inject.css',
            rel: 'stylesheet'
        }));
    }

    for (const plugin of loadPlugins) {
        document.head.appendChild(Object.assign(document.createElement('script'), {
            src: decodeURIComponent(plugin)
        }));
    }

    const onVmInit = vm => {
        for (const extensionURL of extensionURLs) {
            vm.extensionManager.loadExtensionURL(decodeURIComponent(extensionURL));
        }
        vm.requireLimits(imposeLimits, { fencing: spriteFencing });
        global.vm = vm;

        // Compatibility global `Scratch` and `setCloud` for HTMLifier plugins

        global.Scratch = {
            vm: vm,
            get renderer () {
                return vm.runtime.renderer;
            },
            get audioEngine () {
                return vm.runtime.audioEngine;
            },
            get bitmapAdapter () {
                return vm.runtime.v2BitmapAdapter;
            },
            get videoProvider () {
                return vm.runtime.ioDevices.video.provider;
            }
        };

        const CLOUD_PREFIX = '\u2601 ';
        global.setCloud = (name, value) => {
            vm.postIOData('cloud', {
                varUpdate: {
                    name: CLOUD_PREFIX + name,
                    value
                }
            });
        }
    };

    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }

    ReactDOM.render(
        // important: this is checking whether `simulateScratchDesktop` is truthy, not just defined!
        simulateScratchDesktop ?
            <WrappedGui
                canEditTitle
                isScratchDesktop
                showTelemetryModal
                canSave={false}
                onTelemetryModalCancel={handleTelemetryModalCancel}
                onTelemetryModalOptIn={handleTelemetryModalOptIn}
                onTelemetryModalOptOut={handleTelemetryModalOptOut}
            /> :
            <WrappedGui
                canEditTitle
                backpackVisible
                backpackHost={backpackHost}
                cloudHost={cloudHost}
                cloudSpecial={cloudSpecial}
                compatibilityMode={fps || compatibilityMode}
                hasCloudPermission={true}
                canSave={false}
                onClickLogo={onClickLogo}
                onClickChangeUrlSettings={onClickLogo}
                onVmInit={onVmInit}
                username={username}
            />,
        appTarget);
};
