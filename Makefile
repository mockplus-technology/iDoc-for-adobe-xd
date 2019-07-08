VERSION=1.2.4

clean:
	rm -rf built
	rm -rf dist
	-mkdir built

build: clean
	npm run publish
	cp -r images dist/
	cp manifest.json dist/
	cd dist && zip idoc.xdx -r . && mv idoc.xdx ../built/idoc_for_xd_v${VERSION}.xdx
	echo "build xd for Windows done"
	curl https://redmine.mockplus.cn/sys/fetch_changesets?key=lzbLVjChSCn8HZDpz6Rr
