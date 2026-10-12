// Injected only by demo-browser.cjs; never loaded by the published demo.
(async () => {
  const checks = [];
  const check = (condition, label) => { if (!condition) throw new Error(label); checks.push(label); };
  const wait = async predicate => {
    for (let i = 0; i < 150; i++) {
      if (predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    throw new Error('Timed out: ' + predicate.toString());
  };
  const result = document.createElement('output');
  result.id = 'demo-smoke-result'; result.hidden = true;
  const campaign = 'demo-lantern-coast';
  const get = id => document.getElementById(id);
  const marker = id => markerButtons.find(button => button.dataset.locationId === id);
  const scenario = new URLSearchParams(location.search).get('smoke');
  window.confirm = () => true;
  try {
    if (scenario === 'landing') {
      await wait(() => !get('demo-entry').hidden);
      check(!currentUser && get('auth-form').hidden, 'no real sign-in');
      check(get('demo-entry').querySelectorAll('a').length === 2, 'two entry roles');
    } else {
      await wait(() => firebaseSyncStarted && customMarkers.mira && !get('app-shell').hidden);
      check(!window.firebase && !window.FIREBASE_CONFIG, 'production SDK absent');
      if (scenario === 'dm') {
        check(currentUser.uid === 'demo-dm', 'DM identity');
        await showMapImage(marker('briarport'));
        check(currentMap.id === 'briarport', 'linked harbor opens');
        await firebaseDatabase.ref('users/demo-dm/displayName').set('Demo Cartographer');
        await new Promise(resolve => setTimeout(resolve, 50));
        check(currentMap.id === 'briarport', 'profile edits preserve submap');
        userCenterOpen.click();
        const sample = document.createElement('canvas');
        sample.width = 160; sample.height = 100;
        const paint = sample.getContext('2d');
        paint.fillStyle = '#294c50'; paint.fillRect(0, 0, 160, 100);
        paint.fillStyle = '#e6d7b4'; paint.fillRect(30, 20, 70, 60);
        const photo = await new Promise(resolve => sample.toBlob(resolve, 'image/png'));
        const files = new DataTransfer();
        files.items.add(new File([photo], 'local-avatar.png', { type: 'image/png' }));
        profileAvatarInput.files = files.files;
        profileAvatarInput.dispatchEvent(new Event('change'));
        await wait(() => get('avatar-crop-dialog').open && !get('avatar-crop-confirm').disabled);
        get('avatar-crop-confirm').click();
        await wait(() => avatarDraft?.file);
        displayNameForm.requestSubmit();
        await wait(() => !profileSaveBusy && currentUserProfile.avatarUrl?.startsWith('data:image/png;base64,'));
        check(safeAvatarUrl(currentUserProfile.avatarUrl) !== '', 'cropped avatar saved locally');
        userCenterClose.click();
        get('map-return').click();
        await wait(() => currentMap.id === 'coast');
        setMarkerRevealed(marker('hidden-cove'), true);
        await wait(() => isMarkerRevealed(marker('hidden-cove')));
        dmMarkerTitleInput.value = 'Browser Test Beacon';
        dmMarkerDescriptionInput.value = 'Created with the real form state.';
        dmMarkerTypeInput.value = 'temple';
        await createCustomMarkerAtPosition(40, 40);
        check(Object.values(customMarkers).some(m => m.title === 'Browser Test Beacon'), 'marker creation');
        get('campaign-switch').click();
        check(!new URLSearchParams(location.search).has('campaign') && get('app-shell').hidden, 'campaign return clears route');
        get('campaign-list').querySelector('[data-campaign-manage]').click();
        await wait(() => !playersLoading && managedPlayers.length === 15);
        check(get('campaign-member-list').querySelectorAll('article').length === 6, 'party pagination');
        get('invite-search').value = 'Cedar';
        get('invite-search').dispatchEvent(new Event('input'));
        check(get('campaign-invite-list').querySelectorAll('article').length === 1, 'player search');
        get('campaign-invite-list').querySelector('[data-invite-player]').click();
        await wait(() => managedPlayers.find(p => p.uid === 'cedar').role === 'player');
        check((await firebaseDatabase.ref(`userCampaigns/cedar/${campaign}`).once()).val().role === 'player', 'invite persisted');
        get('member-search').value = 'Cedar';
        get('member-search').dispatchEvent(new Event('input'));
        get('campaign-member-list').querySelector('[data-remove-campaign-member]').click();
        await wait(() => managedPlayers.find(p => p.uid === 'cedar').role === '');
        check(!(await firebaseDatabase.ref(`userCampaigns/cedar/${campaign}`).once()).exists(), 'remove persisted');
        campaignNameInput.value = 'Smoke Expedition';
        campaignCreateForm.requestSubmit();
        await wait(() => !campaignCreateBusy && getCurrentCampaignId() !== campaign && !rootMapSetup.hidden);
        const createdCampaign = getCurrentCampaignId();
        await loadImageFileOptions();
        rootMapTitleInput.value = 'Smoke Island';
        rootMapImageFileInput.value = 'lantern-coast.svg';
        rootMapForm.requestSubmit();
        await wait(() => campaignRootMap?.title === 'Smoke Island');
        check(campaignRootMap.src === 'assets/demo/lantern-coast.svg', 'new campaign starting map');
        await deleteCampaign(createdCampaign);
        check(!(await firebaseDatabase.ref('campaigns/' + createdCampaign).once()).exists(), 'new campaign deletion');
        selectCampaign(campaign, true);
        await wait(() => !get('app-shell').hidden && !!customMarkers.mira);
      } else if (scenario === 'reload') {
        check(currentUserProfile.displayName === 'Demo Cartographer', 'profile survives reload');
        check(currentUserProfile.avatarUrl?.startsWith('data:image/png;base64,'), 'avatar survives reload');
        check(isMarkerRevealed(marker('hidden-cove')), 'reveal survives reload');
        check(Object.values(customMarkers).some(m => m.title === 'Browser Test Beacon'), 'marker survives reload');
      } else if (scenario === 'reset') {
        localStorage.setItem('demo-smoke-unrelated', 'keep');
        window.DemoBackend.reset();
        await wait(() => !Object.values(customMarkers).some(m => m.title === 'Browser Test Beacon'));
        check(localStorage.getItem('demo-smoke-unrelated') === 'keep', 'reset preserves unrelated data');
        localStorage.removeItem('demo-smoke-unrelated');
        check(!isMarkerRevealed(marker('hidden-cove')), 'reset restores hidden marker');
      } else {
        check(currentUser.uid === 'demo-player', 'Player identity');
        check((!get('dm-controls') || get('dm-controls').hidden) && (!get('player-management') || get('player-management').hidden), 'DM UI hidden');
        check(marker('hidden-cove').hidden === (scenario !== 'player-after'), 'hidden or revealed player marker');
        get('campaign-switch').click();
        check(!get('campaign-list').querySelector('[data-campaign-manage]'), 'no management on player cards');
        check(!get('campaign-list').querySelector('[data-campaign-delete]'), 'no deletion on player cards');
        selectCampaign(campaign, true);
        await wait(() => !get('app-shell').hidden && !!customMarkers.mira);
      }
      const language = window.I18n.language;
      window.I18n.setLanguage('zh', false);
      check(get('demo-reset').textContent.includes('重置'), 'Chinese switch');
      window.I18n.setLanguage(language, false);
      await wait(() => [...document.images].filter(img => img.getAttribute('src')).every(img => img.complete));
      const broken = [...document.images].filter(img => img.getAttribute('src') && !img.naturalWidth);
      check(!broken.length, 'image assets load: ' + broken.map(img => img.getAttribute('src')).join(','));
    }
    check(document.documentElement.scrollWidth <= innerWidth, 'no horizontal overflow');
    check(performance.getEntriesByType('resource').every(entry => {
      const url = new URL(entry.name); return ['data:', 'blob:'].includes(url.protocol) || url.origin === location.origin;
    }), 'no external resource requests');
    result.textContent = JSON.stringify({ ok: true, scenario, checks });
  } catch (error) {
    result.textContent = JSON.stringify({ ok: false, scenario, error: error.message, checks });
  }
  document.body.append(result);
})();
